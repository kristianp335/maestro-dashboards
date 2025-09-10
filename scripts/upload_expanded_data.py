#!/usr/bin/env python3
"""
Upload 10x expanded sample data to Liferay APIs
Efficiently uploads large datasets with progress tracking
"""

import json
import requests
import base64
import os
import time
from datetime import datetime

# Liferay API configuration
LIFERAY_BASE_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud"

# API endpoints
ENDPOINTS = {
    "clients": "/o/c/maestroclients/",
    "loans": "/o/c/maestroloans/", 
    "deals": "/o/c/maestrodeals/",
    "activities": "/o/c/gfdactivities/",
    "performance": "/o/c/performancekpis/",
    "risk": "/o/c/riskmetricses/",
    "workflow": "/o/c/workflowmetrics/"
}

def get_auth_header():
    """Create Basic Auth header from environment secrets"""
    username = os.getenv('LIFERAY_USERNAME')
    password = os.getenv('LIFERAY_PASSWORD')
    
    if not username or not password:
        raise ValueError("LIFERAY_USERNAME and LIFERAY_PASSWORD environment variables required")
    
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def transform_client_data(client):
    """Transform client data for API"""
    status_mapping = {"active": "Active", "prospect": "Prospect", "inactive": "Inactive"}
    
    return {
        "externalReferenceCode": client["clientId"],
        "clientId": client["clientId"],
        "clientName": client["clientName"],
        "legalEntityType": client["legalEntityType"],
        "country": client["country"],
        "sector": client["sector"],
        "creditRating": client["creditRating"],
        "annualRevenue": client["annualRevenue"],
        "relationshipStartDate": client["relationshipStartDate"],
        "relationshipManager": client["relationshipManager"],
        "clientStatus": status_mapping.get(client["clientStatus"], "Active"),
        "riskClassification": client["riskClassification"],
        "clientNotes": client["clientNotes"]
    }

def transform_loan_data(loan):
    """Transform loan data for API"""
    status_mapping = {
        "application": "application", "under_review": "underreview", "approved": "approved",
        "active": "active", "paid_off": "paidoff", "default": "default", "rejected": "rejected",
        "pending": "underreview", "underreview": "underreview", "paidoff": "paidoff"
    }
    
    return {
        "externalReferenceCode": loan["loanId"],
        "loanId": loan["loanId"],
        "clientName": loan["clientName"],
        "loanAmount": loan["loanAmount"],
        "currency": loan["currency"],
        "loanType": loan["loanType"],
        "loanStatus": status_mapping.get(loan["loanStatus"], "application"),
        "originationDate": loan["originationDate"],
        "maturityDate": loan["maturityDate"],
        "interestRate": loan["interestRate"],
        "riskRating": loan["riskRating"],
        "sector": loan["sector"],
        "purpose": loan["purpose"],
        "notes": loan["notes"]
    }

def transform_deal_data(deal):
    """Transform deal data for API"""
    status_mapping = {
        "lead": "lead", "qualified": "qualified", "proposal": "proposal",
        "negotiation": "negotiation", "closed_won": "closedwon", "closed_lost": "closedlost",
        "due_diligence": "qualified", "approved": "closedwon", "closed": "closedwon",
        "closedwon": "closedwon", "closedlost": "closedlost"
    }
    
    priority_mapping = {"low": "low", "medium": "medium", "high": "high", "critical": "critical"}
    
    return {
        "externalReferenceCode": deal["dealId"],
        "dealId": deal["dealId"],
        "dealName": deal["dealName"],
        "clientName": deal["clientName"],
        "dealValue": deal["dealValue"],
        "currency": deal["currency"],
        "dealStatus": status_mapping.get(deal["dealStatus"], "lead"),
        "priority": priority_mapping.get(deal["priority"], "medium"),
        "expectedClosingDate": deal["expectedClosingDate"],
        "lastUpdated": deal["lastUpdated"],
        "dealType": deal["dealType"],
        "sector": deal["sector"],
        "relationshipManager": deal["relationshipManager"],
        "description": deal["description"]
    }

def transform_activity_data(activity):
    """Transform activity data for API"""
    status_mapping = {
        "planned": "planned", "in_progress": "inprogress", "completed": "completed",
        "cancelled": "cancelled", "on_hold": "onhold", "exception": "onhold",
        "inprogress": "inprogress", "onhold": "onhold"
    }
    
    type_mapping = {
        "client_meeting": "clientmeeting", "phone_call": "phonecall", "document_review": "documentreview",
        "due_diligence": "duediligence", "risk_assessment": "riskassessment", "credit_analysis": "creditanalysis",
        "compliance_check": "compliancecheck", "credit": "creditanalysis", "origination": "duediligence",
        "distribution": "documentreview", "system": "compliancecheck",
        "clientmeeting": "clientmeeting", "phonecall": "phonecall", "documentreview": "documentreview",
        "duediligence": "duediligence", "riskassessment": "riskassessment", "creditanalysis": "creditanalysis",
        "compliancecheck": "compliancecheck"
    }
    
    return {
        "externalReferenceCode": activity["activityId"],
        "activityId": activity["activityId"],
        "activityTitle": activity["activityTitle"],
        "activityDescription": activity["activityDescription"],
        "activityType": type_mapping.get(activity["activityType"], "documentreview"),
        "activityStatus": status_mapping.get(activity["activityStatus"], "planned"),
        "activityDate": activity["activityDate"],
        "relatedEntityId": activity.get("relatedEntityId"),
        "relatedEntityType": activity["relatedEntityType"],
        "createdBy": activity["createdBy"],
        "priority": activity["priority"],
        "notes": activity["notes"]
    }

def transform_performance_data(kpi):
    """Transform performance data for API"""
    external_ref = f"KPI-{kpi['reportDate']}-{kpi.get('periodType', 'Monthly')}"
    
    return {
        "externalReferenceCode": external_ref,
        "reportDate": kpi["reportDate"],
        "totalLoanVolume": kpi["totalLoanVolume"],
        "activeClients": kpi["activeClients"],
        "averageDealSize": kpi["averageDealSize"],
        "portfolioGrowth": kpi["portfolioGrowth"],
        "revenueGenerated": kpi["revenueGenerated"],
        "defaultRate": kpi["defaultRate"],
        "returnOnAssets": kpi["returnOnAssets"],
        "periodType": kpi["periodType"],
        "performanceSummary": kpi["performanceSummary"]
    }

def transform_risk_data(risk):
    """Transform risk data for API"""
    external_ref = f"RISK-{risk['reportDate']}"
    
    return {
        "externalReferenceCode": external_ref,
        "reportDate": risk["reportDate"],
        "totalRiskExposure": risk["totalRiskExposure"],
        "highRiskLoans": risk["highRiskLoans"],
        "averageCreditScore": risk["averageCreditScore"],
        "coverageRatio": risk["coverageRatio"],
        "creditRiskPercentage": risk["creditRiskPercentage"],
        "marketRiskPercentage": risk["marketRiskPercentage"],
        "operationalRiskPercentage": risk["operationalRiskPercentage"],
        "riskTrend": risk["riskTrend"],
        "riskSummary": risk["riskSummary"]
    }

def transform_workflow_data(workflow):
    """Transform workflow data for API"""
    external_ref = f"WORKFLOW-{workflow['reportDate']}"
    
    return {
        "externalReferenceCode": external_ref,
        "reportDate": workflow["reportDate"],
        "activeWorkflows": workflow["activeWorkflows"],
        "avgProcessingTime": workflow["avgProcessingTime"],
        "completionRate": workflow["completionRate"],
        "exceptions": workflow["exceptions"],
        "originationWorkflows": workflow["originationWorkflows"],
        "creditWorkflows": workflow["creditWorkflows"],
        "distributionWorkflows": workflow["distributionWorkflows"],
        "originationProgress": workflow["originationProgress"],
        "creditProgress": workflow["creditProgress"],
        "distributionProgress": workflow["distributionProgress"]
    }

def upload_data_batch(endpoint, data_batch, data_type, batch_num, total_batches):
    """Upload a batch of data to API with error handling"""
    url = LIFERAY_BASE_URL + endpoint
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    success_count = 0
    errors = []
    
    print(f"  📦 Batch {batch_num}/{total_batches}: Uploading {len(data_batch)} {data_type} records...")
    
    for i, record in enumerate(data_batch):
        try:
            response = requests.post(url, json=record, headers=headers)
            
            if response.status_code in [200, 201]:
                success_count += 1
                if i % 10 == 0:  # Progress indicator every 10 records
                    print(f"    ✅ {i+1}/{len(data_batch)} records uploaded...")
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:100]}"
                errors.append(f"Record {i+1}: {error_msg}")
                
        except Exception as e:
            errors.append(f"Record {i+1}: Exception - {str(e)}")
    
    return success_count, errors

def upload_dataset(data_type, filename, transform_func, batch_size=20):
    """Upload complete dataset with batching"""
    print(f"\n🚀 Starting {data_type} data upload...")
    print(f"Target: {LIFERAY_BASE_URL}{ENDPOINTS[data_type]}")
    print("-" * 60)
    
    # Load data
    try:
        with open(f"expanded_data/{filename}", "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"❌ ERROR: {filename} not found")
        return 0, 0
    
    items = data.get("items", [])
    print(f"Found {len(items)} {data_type} records to upload")
    
    # Transform and batch data
    transformed_data = [transform_func(item) for item in items]
    
    # Split into batches
    batches = [transformed_data[i:i + batch_size] for i in range(0, len(transformed_data), batch_size)]
    total_batches = len(batches)
    
    total_success = 0
    total_errors = []
    
    # Upload each batch
    for batch_num, batch in enumerate(batches, 1):
        success_count, errors = upload_data_batch(ENDPOINTS[data_type], batch, data_type, batch_num, total_batches)
        total_success += success_count
        total_errors.extend(errors)
        
        # Short delay between batches to avoid overwhelming the API
        if batch_num < total_batches:
            time.sleep(1)
    
    print(f"\n📊 {data_type.upper()} SUMMARY: {total_success}/{len(items)} records uploaded successfully")
    
    if total_errors:
        print(f"⚠️  {len(total_errors)} errors encountered:")
        for error in total_errors[:5]:  # Show first 5 errors
            print(f"    - {error}")
        if len(total_errors) > 5:
            print(f"    ... and {len(total_errors) - 5} more errors")
    
    return total_success, len(items)

def main():
    """Upload all expanded datasets"""
    print("🚀 Starting massive data upload to Maestro GFD Cockpit APIs...")
    print(f"🔗 Target: {LIFERAY_BASE_URL}")
    print("=" * 70)
    
    start_time = datetime.now()
    
    # Define upload order and transformations
    upload_tasks = [
        ("clients", "expanded-clients.json", transform_client_data),
        ("loans", "expanded-loans.json", transform_loan_data),
        ("deals", "expanded-deals.json", transform_deal_data),
        ("activities", "expanded-activities.json", transform_activity_data),
        ("performance", "expanded-performance-kpis.json", transform_performance_data),
        ("risk", "expanded-risk-metrics.json", transform_risk_data),
        ("workflow", "expanded-workflow-metrics.json", transform_workflow_data),
    ]
    
    total_uploaded = 0
    total_attempted = 0
    
    # Upload each dataset
    for data_type, filename, transform_func in upload_tasks:
        uploaded, attempted = upload_dataset(data_type, filename, transform_func)
        total_uploaded += uploaded
        total_attempted += attempted
    
    end_time = datetime.now()
    duration = end_time - start_time
    
    print("=" * 70)
    print(f"📊 FINAL SUMMARY:")
    print(f"✅ Total records uploaded: {total_uploaded}/{total_attempted}")
    print(f"⏱️  Total time: {duration}")
    print(f"📈 Upload rate: {total_uploaded/duration.total_seconds():.1f} records/second")
    
    if total_uploaded == total_attempted:
        print("🎉 ALL DATA UPLOADED SUCCESSFULLY!")
        print("💼 Your Maestro GFD Cockpit now has 10x more realistic banking data!")
    else:
        success_rate = (total_uploaded/total_attempted) * 100
        print(f"📊 Upload success rate: {success_rate:.1f}%")

if __name__ == "__main__":
    main()