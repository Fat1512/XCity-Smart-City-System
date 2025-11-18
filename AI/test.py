from service.vehicle_speed_service import VehicleSpeedService

service = VehicleSpeedService(tool_name="vehicle_speed_tool")
res = service.process_video(
    source_video="video.mp4",
    image_pts = [(800, 410), (1125, 410), (1920, 850), (0, 850)],
    # M6 is roughly 32 meters wide and 140 meters long there.
    world_pts = [(0, 0), (32, 0), (32, 140), (0, 140)],
    conf=0.3,
    fps_override=25
)
print(res)
