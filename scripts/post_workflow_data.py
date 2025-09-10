#!/usr/bin/env python3
"""
Post Workflow Metrics sample data to Liferay Objects API
"""

import json
import requests
import base64
import os

# Liferay API configuration
LIFERAY_BASE_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud"
WORKFLOW_API_ENDPOINT = "/o/c/workflowmetrics/"

def get_auth_header():
    """Create Basic Auth header from environment secrets"""
    username = os.getenv('LIFERAY_USERNAME')
    password = os.getenv('LIFERAY_PASSWORD')
    
    if not username or not password:
        raise ValueError("LIFERAY_USERNAME and LIFERAY_PASSWORD environment variables required")
    
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def transform_workflow_data(sample_workflow):
    """Transform workflow data from sample format to API format"""
    
    # Create unique external reference code from report date
    report_date = sample_workflow["reportDate"]
    external_ref = f"WORKFLOW-{report_date}"
    
    # Transform data to match API format (no picklist mappings needed)
    api_data = {
        "externalReferenceCode": external_ref,
        "reportDate": sample_workflow["reportDate"],
        "activeWorkflows": sample_workflow["activeWorkflows"],
        "avgProcessingTime": sample_workflow["avgProcessingTime"],
        "completionRate": sample_workflow["completionRate"],
        "exceptions": sample_workflow["exceptions"],
        "originationWorkflows": sample_workflow["originationWorkflows"],
        "creditWorkflows": sample_workflow["creditWorkflows"],
        "distributionWorkflows": sample_workflow["distributionWorkflows"],
        "originationProgress": sample_workflow["originationProgress"],
        "creditProgress": sample_workflow["creditProgress"],
        "distributionProgress": sample_workflow["distributionProgress"]
    }
    
    return api_data

def post_workflow_to_api(workflow_data):
    """Post a single workflow metric to the Liferay API"""
    
    url = LIFERAY_BASE_URL + WORKFLOW_API_ENDPOINT
    
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(url, json=workflow_data, headers=headers)
        
        print(f"Posting Workflow Metric: {workflow_data['reportDate']} ({workflow_data['activeWorkflows']} active)")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print(f"✅ SUCCESS: {workflow_data['reportDate']} workflow metric created successfully")
            return True
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def main():
    """Main function to post all workflow metrics sample data"""
    
    print("🚀 Starting Workflow Metrics data upload to Liferay API...")
    print(f"Target: {LIFERAY_BASE_URL}{WORKFLOW_API_ENDPOINT}")
    print("-" * 60)
    
    # Load sample data
    try:
        with open("liferay-workspace/client-extensions/maestro-batch-objects/batch/maestro-workflow-metrics-sample-data.json", "r") as f:
            sample_data = json.load(f)
    except FileNotFoundError:
        print("❌ ERROR: Sample data file not found")
        return
    except json.JSONDecodeError as e:
        print(f"❌ ERROR: Invalid JSON in sample data file: {e}")
        return
    
    workflows = sample_data.get("items", [])
    print(f"Found {len(workflows)} workflow metrics to upload\n")
    
    success_count = 0
    
    # Post each workflow metric
    for i, workflow in enumerate(workflows, 1):
        print(f"[{i}/{len(workflows)}]", end=" ")
        
        # Transform data format
        api_data = transform_workflow_data(workflow)
        
        # Post to API
        if post_workflow_to_api(api_data):
            success_count += 1
        
        print()  # Add spacing between entries
    
    print("-" * 60)
    print(f"📊 SUMMARY: {success_count}/{len(workflows)} workflow metrics uploaded successfully")
    
    if success_count == len(workflows):
        print("🎉 All workflow metrics uploaded successfully!")
    else:
        print(f"⚠️  {len(workflows) - success_count} workflow metrics failed to upload")

if __name__ == "__main__":
    main()