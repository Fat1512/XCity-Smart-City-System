# Auto-Publish Station Configuration

## Overview

Stations 4, 5, and 6 are configured to automatically publish data when the application starts.

## Behavior

### Record Limits

- Each station (4, 5, 6) sends exactly **1000 records**
- Total records published: **3000 records** (1000 × 3 stations)

### Timing

- Interval: **5 seconds** between each record
- Time per station: ~**1.39 hours** (1000 records × 5 seconds ≈ 5000 seconds)
- Total completion time: ~**1.39 hours** (all 3 stations run in parallel)

### Progress Tracking

- Progress updates every 100 records
- Example output:
  ```
  📊 [Station 4] Progress: 100/1000 records sent
  📊 [Station 4] Progress: 200/1000 records sent
  ...
  ✅ [Station 4] Completed! Sent 1000/1000 records
  ```

### MQTT Topics

- Station 4: `/air/station_4/attrs`
- Station 5: `/air/station_5/attrs`
- Station 6: `/air/station_6/attrs`

## Configuration

To change the number of records per station, modify the parameter in `app.py`:

```python
# In the __main__ section:
start_auto_publish_workers(max_records_per_station=1000)  # Change 1000 to desired value
```

## Auto-Stop Behavior

After sending all 1000 records:

1. Worker marks itself as stopped: `auto_publish_workers[station_no] = False`
2. Prints completion message
3. Thread exits gracefully
4. Station status in `/sensor/status` will show `false` for that station

## Example Status Response

After all stations complete:

```json
{
  "auto_publish_active": {
    "4": false,
    "5": false,
    "6": false
  }
}
```
