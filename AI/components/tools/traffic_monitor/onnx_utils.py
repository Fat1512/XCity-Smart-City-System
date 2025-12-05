# -----------------------------------------------------------------------------
# Copyright 2025 Fenwick Team
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# -----------------------------------------------------------------------------
from typing import Tuple
import numpy as np
import cv2 as cv
import onnxruntime as ort
import traceback

def letterbox(img, new_shape=(640, 640), color=(114,114,114)):
    h0, w0 = img.shape[:2]
    r = min(new_shape[0] / h0, new_shape[1] / w0)
    new_unpad = (int(round(w0 * r)), int(round(h0 * r)))
    dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]
    dw /= 2; dh /= 2
    img_resized = cv.resize(img, new_unpad, interpolation=cv.INTER_LINEAR)
    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
    img_padded = cv.copyMakeBorder(img_resized, top, bottom, left, right, cv.BORDER_CONSTANT, value=color)
    return img_padded, r, left, top

def _nms(boxes, scores, iou_threshold=0.45):
    if boxes is None or len(boxes) == 0:
        return []
    boxes = boxes.astype(float)
    x1 = boxes[:, 0]; y1 = boxes[:, 1]; x2 = boxes[:, 2]; y2 = boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)
    order = scores.argsort()[::-1]
    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(i)
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        w = np.maximum(0.0, xx2 - xx1)
        h = np.maximum(0.0, yy2 - yy1)
        inter = w * h
        ovr = inter / (areas[i] + areas[order[1:]] - inter)
        inds = np.where(ovr <= iou_threshold)[0]
        order = order[inds + 1]
    return keep

def load_onnx(path: str):
    try:
        sess = ort.InferenceSession(path, providers=["CPUExecutionProvider"])
        return sess
    except Exception as e:
        print(f"Failed to load ONNX model {path}: {e}")
        traceback.print_exc()
        raise

def run_onnx(sess, frame_bgr, imgsz=(640,640), conf_thres=0.4):
    if sess is None:
        return np.zeros((0,4)), np.zeros((0,)), np.zeros((0,), dtype=int)

    input_meta = sess.get_inputs()[0]
    input_name = input_meta.name
    input_shape = input_meta.shape
    input_type = getattr(input_meta, "type", None)

    img_padded, r, pad_x, pad_y = letterbox(frame_bgr, new_shape=imgsz)

    shape = input_shape
    nchw = True
    if isinstance(shape, (list, tuple)):
        if len(shape) == 4 and shape[1] == 3:
            nchw = True
        elif len(shape) == 4 and shape[3] == 3:
            nchw = False
        else:
            nchw = True
    else:
        nchw = True

    need_uint8 = False
    if input_type is not None and "uint8" in str(input_type).lower():
        need_uint8 = True

    img_rgb = cv.cvtColor(img_padded, cv.COLOR_BGR2RGB)

    if need_uint8:
        inp = img_rgb.astype(np.uint8)
    else:
        inp = img_rgb.astype(np.float32) / 255.0

    if nchw:
        inp = np.transpose(inp, (2,0,1))
    inp = np.expand_dims(inp, axis=0)

    if need_uint8:
        inp = inp.astype(np.uint8)
    else:
        inp = inp.astype(np.float32)

    try:
        outs = sess.run(None, {input_name: inp})
    except Exception as e:
        print(f"ONNX runtime inference error: {e}")
        traceback.print_exc()
        return np.zeros((0,4)), np.zeros((0,)), np.zeros((0,), dtype=int)

    if len(outs) == 4:
        num_dets = int(outs[0][0][0]) if outs[0].size > 0 else 0
        boxes_raw = outs[1][0][:num_dets]
        scores_raw = outs[2][0][:num_dets]
        classes_raw = outs[3][0][:num_dets]
        boxes, scores, classes = [], [], []
        for i in range(num_dets):
            score = float(scores_raw[i])
            if score < conf_thres: continue
            x1, y1, x2, y2 = boxes_raw[i]
            x1 = (x1 - pad_x) / r
            y1 = (y1 - pad_y) / r
            x2 = (x2 - pad_x) / r
            y2 = (y2 - pad_y) / r
            x1 = max(0.0, min(x1, frame_bgr.shape[1]-1))
            x2 = max(0.0, min(x2, frame_bgr.shape[1]-1))
            y1 = max(0.0, min(y1, frame_bgr.shape[0]-1))
            y2 = max(0.0, min(y2, frame_bgr.shape[0]-1))
            boxes.append([x1,y1,x2,y2]); scores.append(score); classes.append(int(classes_raw[i]))
        if len(boxes) == 0: return np.zeros((0,4)), np.zeros((0,)), np.zeros((0,), dtype=int)
        boxes = np.array(boxes, dtype=float); scores = np.array(scores, dtype=float); classes = np.array(classes, dtype=int)
        keep = _nms(boxes, scores, iou_threshold=0.45)
        if len(keep) == 0: return np.zeros((0,4)), np.zeros((0,)), np.zeros((0,), dtype=int)
        return boxes[keep], scores[keep], classes[keep]
    else:
        out = np.array(outs[0])
        if out.ndim == 3:
            out = out[0]
        if out.size == 0:
            return np.zeros((0,4)), np.zeros((0,)), np.zeros((0,), dtype=int)
        if out.ndim == 2 and out.shape[0] < out.shape[1] and out.shape[0] < 100:
            out = out.T
        if out.shape[1] < 5:
            print(f"ERROR: Each detection has only {out.shape[1]} elements, need at least 5")
            return np.zeros((0,4)), np.zeros((0,)), np.zeros((0,), dtype=int)
        boxes, scores, classes = [], [], []
        for det in out:
            if len(det) < 5: continue
            x, y, w, h = float(det[0]), float(det[1]), float(det[2]), float(det[3])
            conf = float(det[4])
            if len(det) > 5:
                cls_probs = det[5:]
                cls = int(np.argmax(cls_probs))
                try:
                    score = float(conf * float(cls_probs[cls]))
                except Exception:
                    score = conf
            else:
                cls = 0; score = conf
            if score >= conf_thres:
                x1 = x - w/2.0 - pad_x
                y1 = y - h/2.0 - pad_y
                x2 = x + w/2.0 - pad_x
                y2 = y + h/2.0 - pad_y
                x1 /= r; y1 /= r; x2 /= r; y2 /= r
                x1 = max(0.0, min(x1, frame_bgr.shape[1]-1))
                x2 = max(0.0, min(x2, frame_bgr.shape[1]-1))
                y1 = max(0.0, min(y1, frame_bgr.shape[0]-1))
                y2 = max(0.0, min(y2, frame_bgr.shape[0]-1))
                boxes.append([x1,y1,x2,y2]); scores.append(score); classes.append(cls)
        if len(boxes) == 0:
            return np.zeros((0,4)), np.zeros((0,)), np.zeros((0,), dtype=int)
        boxes = np.array(boxes, dtype=float); scores = np.array(scores, dtype=float); classes = np.array(classes, dtype=int)
        keep = _nms(boxes, scores, iou_threshold=0.45)
        if len(keep) == 0:
            return np.zeros((0,4)), np.zeros((0,)), np.zeros((0,), dtype=int)
        return boxes[keep], scores[keep], classes[keep]