#!/usr/bin/env python3
"""
Post Performance KPI sample data to Liferay Objects API
"""

import json
import requests
import base64
import os

# Liferay API configuration
LIFERAY_BASE_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud"
PERFORMANCE_API_ENDPOINT = "/o/c/performancekpis/"

def get_auth_header():
    """Create Basic Auth header from environment secrets"""
    username = os.getenv('LIFERAY_USERNAME')
    password = os.getenv('LIFERAY_PASSWORD')
    
    if not username or not password:
        raise ValueError("LIFERAY_USERNAME and LIFERAY_PASSWORD environment variables required")
    
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def transform_performance_data(sample_kpi):
    """Transform performance data from sample format to API format"""
    
    # Create unique external reference code from report date
    report_date = sample_kpi["reportDate"]
    period_type = sample_kpi.get("periodType", "Monthly")
    external_ref = f"KPI-{report_date}-{period_type}"
    
    # Transform data to match API format (no picklist mappings needed)
    api_data = {
        "externalReferenceCode": external_ref,
        "reportDate": sample_kpi["reportDate"],
        "totalLoanVolume": sample_kpi["totalLoanVolume"],
        "activeClients": sample_kpi["activeClients"],
        "averageDealSize": sample_kpi["averageDealSize"],
        "portfolioGrowth": sample_kpi["portfolioGrowth"],
        "revenueGenerated": sample_kpi["revenueGenerated"],
        "defaultRate": sample_kpi["defaultRate"],
        "returnOnAssets": sample_kpi["returnOnAssets"],
        "periodType": sample_kpi["periodType"],
        "performanceSummary": sample_kpi["performanceSummary"]
    }
    
    return api_data

def post_performance_to_api(performance_data):
    """Post a single performance KPI to the Liferay API"""
    
    url = LIFERAY_BASE_URL + PERFORMANCE_API_ENDPOINT
    
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(url, json=performance_data, headers=headers)
        
        print(f"Posting KPI: {performance_data['reportDate']} ({performance_data['periodType']})")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print(f"✅ SUCCESS: {performance_data['reportDate']} KPI created successfully")
            return True
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def main():
    """Main function to post all performance KPI sample data"""
    
    print("🚀 Starting Performance KPI data upload to Liferay API...")
    print(f"Target: {LIFERAY_BASE_URL}{PERFORMANCE_API_ENDPOINT}")
    print("-" * 60)
    
    # Load sample data
    try:
        with open("liferay-workspace/client-extensions/maestro-batch-objects/batch/maestro-performance-kpis-sample-data.json", "r") as f:
            sample_data = json.load(f)
    except FileNotFoundError:
        print("❌ ERROR: Sample data file not found")
        return
    except json.JSONDecodeError as e:
        print(f"❌ ERROR: Invalid JSON in sample data file: {e}")
        return
    
    kpis = sample_data.get("items", [])
    print(f"Found {len(kpis)} performance KPIs to upload\n")
    
    success_count = 0
    
    # Post each KPI
    for i, kpi in enumerate(kpis, 1):
        print(f"[{i}/{len(kpis)}]", end=" ")
        
        # Transform data format
        api_data = transform_performance_data(kpi)
        
        # Post to API
        if post_performance_to_api(api_data):
            success_count += 1
        
        print()  # Add spacing between entries
    
    print("-" * 60)
    print(f"📊 SUMMARY: {success_count}/{len(kpis)} performance KPIs uploaded successfully")
    
    if success_count == len(kpis):
        print("🎉 All performance KPIs uploaded successfully!")
    else:
        print(f"⚠️  {len(kpis) - success_count} performance KPIs failed to upload")

if __name__ == "__main__":
    main()