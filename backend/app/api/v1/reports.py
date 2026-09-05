from fastapi import APIRouter, Response
from typing import Dict, Any
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Report Generation"])

@router.get("/generate")
async def generate_report(report_type: str = "Comprehensive") -> Dict[str, Any]:
    return report_service.generate_comprehensive_report(report_type)

@router.get("/export-csv")
async def export_report_csv():
    report_data = report_service.generate_comprehensive_report("Comprehensive")
    csv_content = report_service.export_csv(report_data)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=AI-CityTwin-Audit-Report.csv"}
    )
