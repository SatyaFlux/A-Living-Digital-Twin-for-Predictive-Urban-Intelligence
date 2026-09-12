import math
from typing import List
from app.schemas.schemas import CameraFeedDTO, DetectionObjectDTO

class VisionPipeline:
    def __init__(self):
        self.frame_index = 0
        self.cameras = [
            {"id": "CAM_01_GATE2", "location_name": "Gate 2 Arterial Intersection", "base_vehicles": 18, "base_pedestrians": 8},
            {"id": "CAM_02_TECH_BLVD", "location_name": "Tech Boulevard North View", "base_vehicles": 14, "base_pedestrians": 12},
            {"id": "CAM_03_TRANSIT_PLAZA", "location_name": "South Gateway Metro Intermodal Plaza", "base_vehicles": 6, "base_pedestrians": 32}
        ]

    def process_camera_stream(self, camera_id: str = "CAM_01_GATE2") -> CameraFeedDTO:
        self.frame_index += 1
        cam_meta = next((c for c in self.cameras if c["id"] == camera_id), self.cameras[0])
        
        # Calculate dynamic counts with pseudo-motion
        t = self.frame_index * 0.1
        v_count = max(4, int(cam_meta["base_vehicles"] + math.sin(t) * 4))
        p_count = max(2, int(cam_meta["base_pedestrians"] + math.cos(t) * 6))
        
        detections: List[DetectionObjectDTO] = []
        vehicle_types = {"car": 0, "bus": 0, "truck": 0, "motorcycle": 0, "pedestrian": 0, "bicycle": 0}
        
        # Generate anonymous bounding boxes with realistic normalized coordinates [x, y, w, h]
        for i in range(v_count):
            obj_id = f"veh_{camera_id}_{i}"
            v_type = "car" if i % 4 != 0 else ("bus" if i % 8 == 0 else ("truck" if i % 6 == 0 else "motorcycle"))
            vehicle_types[v_type] += 1
            
            # Simulated vehicle movement along road lanes
            lane = i % 3
            lane_x = 0.2 + lane * 0.25
            y_pos = (0.15 + ((i * 0.18 + t * 0.05) % 0.70))
            w = 0.14 if v_type in ["bus", "truck"] else 0.08
            h = 0.10 if v_type in ["bus", "truck"] else 0.06
            conf = round(0.85 + (hash(obj_id) % 12) * 0.01, 2)
            speed = round(32.0 + (hash(obj_id) % 25) + math.sin(t + i) * 5, 1)

            detections.append(DetectionObjectDTO(
                id=obj_id,
                label=v_type,
                confidence=conf,
                bbox=[round(lane_x, 3), round(y_pos, 3), round(w, 3), round(h, 3)],
                speed_kmh=speed
            ))

        # Pedestrians / Cyclists in sidewalk zones
        for j in range(p_count):
            obj_id = f"ped_{camera_id}_{j}"
            p_type = "pedestrian" if j % 5 != 0 else "bicycle"
            vehicle_types[p_type] += 1
            
            side_x = 0.05 if j % 2 == 0 else 0.85
            y_pos = 0.2 + ((j * 0.12 + t * 0.02) % 0.65)
            detections.append(DetectionObjectDTO(
                id=obj_id,
                label=p_type,
                confidence=round(0.88 + (hash(obj_id) % 10) * 0.01, 2),
                bbox=[round(side_x, 3), round(y_pos, 3), 0.035, 0.07],
                speed_kmh=round(4.5 + (hash(obj_id) % 3), 1)
            ))

        crowd_density = min(100.0, (p_count / 40.0) * 100.0)
        avg_speed = sum(d.speed_kmh or 0.0 for d in detections if d.label != "pedestrian") / max(1, v_count)

        return CameraFeedDTO(
            camera_id=camera_id,
            location_name=cam_meta["location_name"],
            fps=29.97,
            total_vehicles=v_count,
            vehicle_types=vehicle_types,
            crowd_density_pct=round(crowd_density, 1),
            average_speed_kmh=round(avg_speed, 1),
            detections=detections,
            is_simulated_stream=True
        )

vision_pipeline = VisionPipeline()
