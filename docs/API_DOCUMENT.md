# 🌆 X-City Smart City System - API Documentation

## ⚡ Air Quality Endpoints

### GET `/air/monthly-statics`

**Query Parameters:**

- `sensorId` (string, required)
- `year` (integer, required)
- `month` (integer, required)

**Response: 200 OK**

```json
{
  "sensorId": "urn:ngsi-ld:Device:44babf7c-3e66-4d2f-b519-1bfb9a4164ab",
  "dataPoints": [
    {
      "day": "2025-11-01",
      "avgPm1": 12.5,
      "avgPm10": 12,
      "avgPm25": 21,
      "avgCo2": 13,
      "avgO3": 31,
      "avgTemperature": 21,
      "avgRelativeHumidity": 21
    },
    {
      "day": "2025-11-02",
      "avgPm1": 12,
      "avgPm10": 12,
      "avgPm25": 12,
      "avgCo2": 12,
      "avgO3": 12,
      "avgTemperature": 12,
      "avgRelativeHumidity": 12
    },

    ...

    {
      "day": "2025-11-30",
      "avgPm1": 12,
      "avgPm10": 12,
      "avgPm25": 12,
      "avgCo2": 12,
      "avgO3": 12,
      "avgTemperature": 12,
      "avgRelativeHumidity": 12
    }
  ]
}
```

### GET `/air/daily-statics`

**Query Parameters:**

- `sensorId` (string, required)
- `date` (string, format `YYYY-MM-DD`, required)

**Response: 200 OK**

```json
{
  "refDevice": "camera-01",
  "dataPoints": [
    {
      "hour": "2025-11-26 00:00:00",
      "totalIntensity": 20,
      "avgSpeed": 30.5
    },
    {
      "hour": "2025-11-26 01:00:00",
      "totalIntensity": 20,
      "avgSpeed":  30.5
    },
    ...
    {
      "hour": "2025-11-26 22:00:00",
       "totalIntensity": 4,
      "avgSpeed":  40
    },
    {
      "hour": "2025-11-26 23:00:00",
       "totalIntensity": 5,
      "avgSpeed":  35
    }
  ]
}
```

## ⚡ Alert Endpoints

### GET `/alert-notification`

**Query Parameters:**

- `page` (integer, optional, default: 0) - Page index
- `size` (integer, optional, default: 10) - Number of items per page
- `solved` (boolean, optional) - Filter by solved status

**Response: 200 OK**

```json
{
  "total": 3,
  "solved": 0,
  "unsolved": 3,
  "traffic": 0,
  "categoryCounts": {
    "weather": 1,
    "traffic": 2
  },
  "subCategoryCounts": {
    "carAccident": 2,
    "airPollution": 1
  },
  "recentAlerts": [
    {
      "id": "urn:ngsi-ld:Alert:77d48cb7-1513-45a1-ad7e-73dbe6c389a7",
      "address": {
        "addressCountry": null,
        "addressLocality": "Gò Vấp",
        "addressRegion": "Hồ Chí Minh",
        "district": null,
        "postOfficeBoxNumber": null,
        "postalCode": null,
        "streetAddress": "493A, Nguyễn Văn Công",
        "streetNr": null
      },
      "alertSource": null,
      "category": "weather",
      "dataProvider": null,
      "dateCreated": "2025-11-29T10:50:04.016Z",
      "dateIssued": "2025-11-29T10:50:04.016Z",
      "dateModified": "2025-11-29T17:50:04.091",
      "description": "Ô nhiễm",
      "location": {
        "bbox": null,
        "coordinates": [106.674964, 10.819152],
        "type": "Point"
      },
      "name": "Lê Tân",
      "source": null,
      "subCategory": "airPollution",
      "solved": false
    },
    {
      "id": "urn:ngsi-ld:Alert:93047fa2-18dc-4521-a444-76709c00ece1",
      "address": {
        "addressCountry": null,
        "addressLocality": "Bảy Hiển",
        "addressRegion": "Hồ Chí Minh",
        "district": null,
        "postOfficeBoxNumber": null,
        "postalCode": null,
        "streetAddress": "49A, Lê Trung Nghĩa",
        "streetNr": null
      },
      "alertSource": null,
      "category": "traffic",
      "dataProvider": null,
      "dateCreated": "2025-11-29T08:24:33.365Z",
      "dateIssued": "2025-11-29T08:24:33.365Z",
      "dateModified": "2025-11-29T15:24:33.376",
      "description": "Xe đụnggggg",
      "location": {
        "bbox": null,
        "coordinates": [106.649824, 10.800665],
        "type": "Point"
      },
      "name": "Lê Tân",
      "source": null,
      "subCategory": "carAccident",
      "solved": false
    },
    {
      "id": "urn:ngsi-ld:Alert:3132b82a-ce28-429a-90e2-b767aa56e6c8",
      "address": {
        "addressCountry": null,
        "addressLocality": "Gò Vấp",
        "addressRegion": "Hồ Chí Minh",
        "district": null,
        "postOfficeBoxNumber": null,
        "postalCode": null,
        "streetAddress": "799/15/2, Nguyễn Kiệm",
        "streetNr": null
      },
      "alertSource": null,
      "category": "traffic",
      "dataProvider": null,
      "dateCreated": "2025-11-29T08:17:14.703Z",
      "dateIssued": "2025-11-29T08:17:14.703Z",
      "dateModified": "2025-11-29T15:17:14.716",
      "description": "Xe hơi đụng nhau",
      "location": {
        "bbox": null,
        "coordinates": [106.6827776, 10.8199936],
        "type": "Point"
      },
      "name": "Lê Tân",
      "source": null,
      "subCategory": "carAccident",
      "solved": false
    }
  ]
}
```

### GET `/alerts`

**Query Parameters:**

- `page` (integer, optional, default: 0) - Page index
- `size` (integer, optional, default: 10) - Number of items per page

**Response: 200 OK**

```json
{
  "content": [
    {
      "id": "urn:ngsi-ld:Alert:77d48cb7-1513-45a1-ad7e-73dbe6c389a7",
      "address": {
        "addressCountry": null,
        "addressLocality": "Gò Vấp",
        "addressRegion": "Hồ Chí Minh",
        "district": null,
        "postOfficeBoxNumber": null,
        "postalCode": null,
        "streetAddress": "493A, Nguyễn Văn Công",
        "streetNr": null
      },
      "alertSource": null,
      "category": "weather",
      "dataProvider": null,
      "dateCreated": "2025-11-29T10:50:04.016Z",
      "dateIssued": "2025-11-29T10:50:04.016Z",
      "dateModified": "2025-11-29T17:50:04.091",
      "description": "Ô nhiễm",
      "location": {
        "bbox": null,
        "coordinates": [106.674964, 10.819152],
        "type": "Point"
      },
      "name": "Lê Tân",
      "source": null,
      "subCategory": "airPollution",
      "solved": false
    },
    {
      "id": "urn:ngsi-ld:Alert:3132b82a-ce28-429a-90e2-b767aa56e6c8",
      "address": {
        "addressCountry": null,
        "addressLocality": "Gò Vấp",
        "addressRegion": "Hồ Chí Minh",
        "district": null,
        "postOfficeBoxNumber": null,
        "postalCode": null,
        "streetAddress": "799/15/2, Nguyễn Kiệm",
        "streetNr": null
      },
      "alertSource": null,
      "category": "traffic",
      "dataProvider": null,
      "dateCreated": "2025-11-29T08:17:14.703Z",
      "dateIssued": "2025-11-29T08:17:14.703Z",
      "dateModified": "2025-11-29T15:17:14.716",
      "description": "Xe hơi đụng nhau",
      "location": {
        "bbox": null,
        "coordinates": [106.6827776, 10.8199936],
        "type": "Point"
      },
      "name": "Lê Tân",
      "source": null,
      "subCategory": "carAccident",
      "solved": false
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1,
  "last": true
}
```

### POST `/alert`

**Body Example:**

```json
{
  "name": "Tại nan",
  "category": "traffic",
  "subCategory": "carAccident",
  "description": "Có tai nạn giao thông nghiêm trọng",
  "address": {
    "streetAddress": "493A, Nguyễn Văn Công",
    "addressLocality": "Bảy Hiển",
    "addressRegion": "Hồ Chí Minh"
  },
  "location": {
    "type": "Point",
    "coordinates": [106.674964, 10.819152]
  }
}
```

**Response: 201 CREATED**

```json
{
  "message": "Successfully created",
  "httpStatus": 201
}
```

### PUT `/alert/{id}/solved`

**Path Parameters:**

- `id` (string, required)

**Response: 200 OK**

```json
{
  "message": "Successfully updated",
  "httpStatus": 200
}
```

## ⚡ Camera Endpoints

### GET `/camera/{id}`

**Path Parameters:**

- `id` (string, required)

**Response: 200 OK**

```json
{
  "id": "urn:ngsi-ld:Camera:70027910-094d-4567-82bf-341ad3156f8e",
  "address": {
    "addressCountry": null,
    "addressLocality": "Ho Chi Minh City",
    "addressRegion": "Vĩnh Long",
    "district": "Quận 10",
    "postOfficeBoxNumber": null,
    "postalCode": null,
    "streetAddress": "80/1A 18",
    "streetNr": "123"
  },
  "cameraName": "Cam02",
  "dataProvider": "X City",
  "dateCreated": null,
  "dateModified": [2025, 11, 22, 20, 4, 30, 835000000],
  "description": "Cam02 siêu đẹp",
  "cameraUsage": "TRAFFIC",
  "location": {
    "bbox": null,
    "coordinates": [106.6650688095113, 10.77208774378424],
    "type": "Point"
  },
  "on": false,
  "type": "Camera"
}
```

### POST `/camera`

**Body Example:**

```json
{
  "address": {
    "addressCountry": null,
    "addressLocality": "Ho Chi Minh City",
    "addressRegion": "Vĩnh Long",
    "district": "Quận 10",
    "postOfficeBoxNumber": null,
    "postalCode": null,
    "streetAddress": "80/1A 18",
    "streetNr": "123"
  },
  "cameraName": "Cam02",
  "dataProvider": "X City",
  "description": "Cam02 siêu đẹp",
  "cameraUsage": "TRAFFIC",
  "location": {
    "type": "Point",
    "coordinates": [106.6650688095113, 10.77208774378424]
  }
}
```

**Response: 201 CREATED**

```json
{
  "message": "Successfully created",
  "httpStatus": 201
}
```

### PUT `/camera/{id}`

## Path Parameters:

- `id` (string, required)

**Body Example:**

```json
{
  "address": {
    "addressCountry": null,
    "addressLocality": "Ho Chi Minh City",
    "addressRegion": "Vĩnh Long",
    "district": "Quận 10",
    "postOfficeBoxNumber": null,
    "postalCode": null,
    "streetAddress": "80/1A 18",
    "streetNr": "123"
  },
  "cameraName": "Cam02",
  "dataProvider": "X City",
  "description": "Cam02 siêu đẹp",
  "cameraUsage": "TRAFFIC",
  "location": {
    "type": "Point",
    "coordinates": [106.6650688095113, 10.77208774378424]
  }
}
```

**Response: 200 OK**

```json
{
  "message": "Successfully updated",
  "httpStatus": 200
}
```

### GET `/cameras`

**Query Parameters:**

- `kw` (string, optional, default: "") - Keyword search
- `page` (integer, optional, default: 0) - Page index
- `size` (integer, optional, default: 10) - Number of items per page

**Response: 200 OK**

```json
{
  "content": [
    {
      "id": "urn:ngsi-ld:Camera:70027910-094d-4567-82bf-341ad3156f8e",
      "address": {
        "addressCountry": null,
        "addressLocality": "Ho Chi Minh City",
        "addressRegion": "Vĩnh Long",
        "district": "Quận 10",
        "postOfficeBoxNumber": null,
        "postalCode": null,
        "streetAddress": "80/1A 18",
        "streetNr": "123"
      },
      "cameraName": "Cam02",
      "dataProvider": "X City",
      "dateCreated": null,
      "dateModified": [2025, 11, 22, 20, 4, 30, 835000000],
      "description": "Cam02 siêu đẹp",
      "cameraUsage": "TRAFFIC",
      "location": {
        "bbox": null,
        "coordinates": [106.6650688095113, 10.77208774378424],
        "type": "Point"
      },
      "on": false,
      "type": "Camera"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

## ⚡ Device Endpoints

### GET `/devices`

**Query Parameters:**

- `kw` (string, optional, default: "") - Keyword search
- `skip` (integer, optional, default: 0) - Number of records to skip
- `limit` (integer, optional, default: 100) - Max number of records

**Response: 200 OK**

```json
{
  "content": [
    {
      "id": "urn:ngsi-ld:Device:a27be672-ad11-4380-972e-9128a132c496",
      "name": "Air sensor",
      "deviceState": "INACTIVE",
      "address": {
        "addressCountry": null,
        "addressLocality": "Ho Chi Minh City",
        "addressRegion": "Miền Nam",
        "district": "Quận 10",
        "postOfficeBoxNumber": null,
        "postalCode": null,
        "streetAddress": "Đường 3/2",
        "streetNr": "123"
      },
      "category": ["sensor"],
      "controlledProperty": ["airPollution"],
      "dateCreated": null,
      "dateModified": [2025, 11, 16, 17, 3, 36, 515000000],
      "description": "Sensor xịn",
      "location": {
        "bbox": null,
        "coordinates": [106.66869670647293, 10.768517381247946],
        "type": "Point"
      },
      "owner": null,
      "provider": "X City !",
      "source": null,
      "type": "Device"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

### POST `/device`

**Body Example:**

```json
{
  "name": "Senor 01",
  "description": "Sensor siêu chất lượng",
  "address": {
    "addressRegion": "Hồ Chí Minh City",
    "addressLocality": "Gò Vập",
    "streetAddress": "49A, Lê Trung Nghĩa"
  },
  "provider": "X City",
  "category": ["sensor"],
  "controlledProperty": ["airPollution"],
  "location": {
    "type": "Point",
    "coordinates": [106.65045351552533, 10.800794459332323]
  }
}
```

**Response: 201 CREATED**

```json
{
  "message": "Successfully created",
  "httpStatus": 201
}
```

### PUT `/device/{id}`

**Path Parameters:**

- `id` (string, required)

**Body Example:**

```json
{
  "name": "Senor 01",
  "description": "Sensor siêu chất lượng",
  "address": {
    "addressRegion": "Hồ Chí Minh City",
    "addressLocality": "Gò Vập",
    "streetAddress": "49A, Lê Trung Nghĩa"
  },
  "provider": "X City",
  "category": ["sensor"],
  "controlledProperty": ["airPollution"],
  "location": {
    "type": "Point",
    "coordinates": [106.65045351552533, 10.800794459332323]
  }
}
```

**Response: 200 OK**

```json
{
  "message": "Successfully updated",
  "httpStatus": 201
}
```

## ⚡ Traffic Endpoints

### GET `/traffic/daily-statics/{cameraId}`

**Path Parameters:**

- `cameraId` (string, required)

**Query Parameters:**

- `date` (string, format `YYYY-MM-DD`, required)

**Response: 200 OK**

```json
{
  "cameraId": "camera-01",
  "date": "2025-11-29",
  "totalVehicles": 350,
  "averageSpeed": 32.5
}
```
