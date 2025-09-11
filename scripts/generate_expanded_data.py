#!/usr/bin/env python3
"""
Generate 10x expanded sample data for Maestro GFD Cockpit
Creates realistic banking data across all object types
"""

import json
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Realistic company data for expanded dataset
COMPANIES = [
    # French CAC 40 and major companies
    {"name": "LVMH Moët Hennessy", "sector": "Consumer Goods", "country": "France", "revenue": 79183000000, "rating": "AA-"},
    {"name": "TotalEnergies SE", "sector": "Energy", "country": "France", "revenue": 184000000000, "rating": "A-"},
    {"name": "EDF Group", "sector": "Utilities", "country": "France", "revenue": 84500000000, "rating": "A"},
    {"name": "Air France-KLM", "sector": "Transportation", "country": "France", "revenue": 26762000000, "rating": "BBB+"},
    {"name": "Schneider Electric", "sector": "Technology", "country": "France", "revenue": 34178000000, "rating": "A+"},
    {"name": "Airbus SE", "sector": "Aerospace", "country": "France", "revenue": 70478000000, "rating": "A"},
    {"name": "Sanofi SA", "sector": "Healthcare", "country": "France", "revenue": 44407000000, "rating": "A+"},
    {"name": "Carrefour Group", "sector": "Retail", "country": "France", "revenue": 87911000000, "rating": "BBB"},
    {"name": "Orange SA", "sector": "Telecommunications", "country": "France", "revenue": 42515000000, "rating": "BBB+"},
    {"name": "Veolia Environnement", "sector": "Environmental Services", "country": "France", "revenue": 29525000000, "rating": "BBB+"},
    {"name": "Thales Group", "sector": "Defense & Aerospace", "country": "France", "revenue": 16183000000, "rating": "A-"},
    {"name": "Danone SA", "sector": "Food & Beverages", "country": "France", "revenue": 24281000000, "rating": "BBB+"},
    {"name": "Société Générale", "sector": "Financial Services", "country": "France", "revenue": 25014000000, "rating": "A-"},
    {"name": "BNP Paribas", "sector": "Financial Services", "country": "France", "revenue": 44306000000, "rating": "A"},
    {"name": "Crédit Agricole", "sector": "Financial Services", "country": "France", "revenue": 38524000000, "rating": "A"},
    {"name": "L'Oréal SA", "sector": "Consumer Goods", "country": "France", "revenue": 38260000000, "rating": "AA-"},
    {"name": "Michelin Group", "sector": "Manufacturing", "country": "France", "revenue": 28589000000, "rating": "BBB+"},
    {"name": "Peugeot SA", "sector": "Automotive", "country": "France", "revenue": 75014000000, "rating": "BBB"},
    {"name": "Renault Group", "sector": "Automotive", "country": "France", "revenue": 46214000000, "rating": "BB+"},
    {"name": "Vinci SA", "sector": "Construction", "country": "France", "revenue": 58038000000, "rating": "A-"},
    
    # Major European companies
    {"name": "Royal Dutch Shell", "sector": "Energy", "country": "Netherlands", "revenue": 261542000000, "rating": "A"},
    {"name": "ASML Holding", "sector": "Technology", "country": "Netherlands", "revenue": 21172000000, "rating": "AA-"},
    {"name": "Siemens AG", "sector": "Technology", "country": "Germany", "revenue": 72004000000, "rating": "A"},
    {"name": "SAP SE", "sector": "Technology", "country": "Germany", "revenue": 31218000000, "rating": "AA-"},
    {"name": "BMW Group", "sector": "Automotive", "country": "Germany", "revenue": 142610000000, "rating": "A-"},
    {"name": "Mercedes-Benz Group", "sector": "Automotive", "country": "Germany", "revenue": 168047000000, "rating": "A-"},
    {"name": "Volkswagen AG", "sector": "Automotive", "country": "Germany", "revenue": 279236000000, "rating": "BBB+"},
    {"name": "BASF SE", "sector": "Chemicals", "country": "Germany", "revenue": 78595000000, "rating": "A-"},
    {"name": "Bayer AG", "sector": "Healthcare", "country": "Germany", "revenue": 47262000000, "rating": "BBB"},
    {"name": "Deutsche Telekom", "sector": "Telecommunications", "country": "Germany", "revenue": 108790000000, "rating": "BBB+"},
    {"name": "Nestlé SA", "sector": "Food & Beverages", "country": "Switzerland", "revenue": 94380000000, "rating": "AA"},
    {"name": "Novartis AG", "sector": "Healthcare", "country": "Switzerland", "revenue": 50034000000, "rating": "AA-"},
    {"name": "Roche Holding", "sector": "Healthcare", "country": "Switzerland", "revenue": 63285000000, "rating": "AA"},
    {"name": "Spotify Technology", "sector": "Technology", "country": "Sweden", "revenue": 13245000000, "rating": "BB+"},
    {"name": "Ericsson AB", "sector": "Technology", "country": "Sweden", "revenue": 25262000000, "rating": "BBB"},
    {"name": "Volvo Group", "sector": "Automotive", "country": "Sweden", "revenue": 46669000000, "rating": "BBB+"},
    {"name": "Nokia Corporation", "sector": "Technology", "country": "Finland", "revenue": 24915000000, "rating": "BBB"},
    {"name": "ING Group", "sector": "Financial Services", "country": "Netherlands", "revenue": 18766000000, "rating": "A-"},
    {"name": "Philips NV", "sector": "Healthcare", "country": "Netherlands", "revenue": 18164000000, "rating": "BBB"},
    {"name": "Banco Santander", "sector": "Financial Services", "country": "Spain", "revenue": 50399000000, "rating": "A-"},
    {"name": "Telefónica SA", "sector": "Telecommunications", "country": "Spain", "revenue": 40971000000, "rating": "BBB+"},
    {"name": "Iberdrola SA", "sector": "Utilities", "country": "Spain", "revenue": 44067000000, "rating": "BBB+"},
    {"name": "Repsol SA", "sector": "Energy", "country": "Spain", "revenue": 56008000000, "rating": "BBB"},
    {"name": "Inditex SA", "sector": "Retail", "country": "Spain", "revenue": 32569000000, "rating": "A-"},
    {"name": "Eni SpA", "sector": "Energy", "country": "Italy", "revenue": 93821000000, "rating": "BBB"},
    {"name": "Enel SpA", "sector": "Utilities", "country": "Italy", "revenue": 95301000000, "rating": "BBB+"},
    {"name": "Intesa Sanpaolo", "sector": "Financial Services", "country": "Italy", "revenue": 21618000000, "rating": "BBB+"},
    {"name": "UniCredit Group", "sector": "Financial Services", "country": "Italy", "revenue": 21052000000, "rating": "BBB"},
    {"name": "AB InBev", "sector": "Food & Beverages", "country": "Belgium", "revenue": 57786000000, "rating": "BBB+"},
    {"name": "Accenture plc", "sector": "Technology", "country": "Ireland", "revenue": 64111000000, "rating": "A"},
    {"name": "CRH plc", "sector": "Construction", "country": "Ireland", "revenue": 34706000000, "rating": "BBB+"},
]

SECTORS = ["Energy", "Financial Services", "Technology", "Healthcare", "Manufacturing", "Retail", "Transportation", 
          "Telecommunications", "Utilities", "Consumer Goods", "Automotive", "Aerospace", "Construction", 
          "Food & Beverages", "Chemicals", "Defense & Aerospace", "Environmental Services"]

LOAN_TYPES = ["Corporate Credit Line", "Term Loan", "Infrastructure Financing", "Working Capital", "Green Bond", 
             "Syndicated Loan", "Bridge Financing", "Equipment Financing", "Trade Financing", "Project Finance",
             "Acquisition Finance", "Real Estate Finance", "Asset-Based Lending", "Revolving Credit", "Export Finance"]

DEAL_TYPES = ["Syndicated Loan", "Bond Issuance", "Credit Facility", "Term Loan", "Green Financing", 
             "Acquisition Finance", "Infrastructure Bond", "Corporate Credit Line", "Project Finance", "Trade Finance"]

RELATIONSHIP_MANAGERS = ["Marie Dubois", "Jean-Pierre Martin", "Claire Lefevre", "Antoine Rousseau", "Sophie Bernard",
                        "Philippe Moreau", "Catherine Durand", "Laurent Petit", "Isabelle Roux", "Nicolas Girard",
                        "Sylvie Mercier", "François Blanc", "Nathalie Simon", "Pierre Garnier", "Céline Fabre"]

def generate_clients(count=50):
    """Generate expanded client data"""
    clients = []
    used_companies = set()
    
    for i in range(count):
        # Select unique company
        available_companies = [c for c in COMPANIES if c["name"] not in used_companies]
        if not available_companies:
            # Create synthetic company if we run out
            company = {
                "name": f"European Corp {i+1}",
                "sector": random.choice(SECTORS),
                "country": random.choice(["France", "Germany", "Netherlands", "Spain", "Italy"]),
                "revenue": random.randint(1000000000, 50000000000),
                "rating": random.choice(["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-"])
            }
        else:
            company = random.choice(available_companies)
            used_companies.add(company["name"])
        
        client = {
            "clientId": f"CL-{company['name'][:3].upper()}-{str(i+1).zfill(3)}",
            "clientName": company["name"],
            "legalEntityType": random.choice(["Public Limited Company", "Private Limited Company", "State-Owned Enterprise", "Cooperative"]),
            "country": company["country"],
            "sector": company["sector"],
            "creditRating": company["rating"],
            "annualRevenue": float(company["revenue"]),
            "relationshipStartDate": (datetime.now() - timedelta(days=random.randint(365, 2555))).strftime("%Y-%m-%d"),
            "relationshipManager": random.choice(RELATIONSHIP_MANAGERS),
            "clientStatus": random.choice(["active", "active", "active", "active", "prospect", "inactive"]),  # Weighted toward active
            "riskClassification": random.choice(["Low", "Medium", "High"]),
            "clientNotes": f"Strategic relationship with {company['sector'].lower()} sector leader. Strong ESG commitment and {random.choice(['regional', 'global', 'european'])} market presence."
        }
        clients.append(client)
    
    return clients

def generate_loans(count=50):
    """Generate expanded loan data"""
    loans = []
    
    for i in range(count):
        amount = random.randint(5000000, 500000000)
        client_name = random.choice([c["name"] for c in COMPANIES])
        
        loan = {
            "loanId": f"LN-2025-{str(i+1000).zfill(4)}",
            "clientName": client_name,
            "loanAmount": float(amount),
            "currency": random.choice(["EUR", "USD", "GBP"]),
            "loanType": random.choice(LOAN_TYPES),
            "loanStatus": random.choice(["approved", "active", "active", "active", "underreview", "application", "paidoff"]),
            "originationDate": (datetime.now() - timedelta(days=random.randint(30, 1825))).strftime("%Y-%m-%d"),
            "maturityDate": (datetime.now() + timedelta(days=random.randint(365, 3650))).strftime("%Y-%m-%d"),
            "interestRate": round(random.uniform(2.5, 6.5), 2),
            "riskRating": random.choice(["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-", "BB+"]),
            "sector": random.choice(SECTORS),
            "purpose": random.choice([
                "Business expansion and market growth",
                "Equipment acquisition and modernization", 
                "Working capital optimization",
                "Sustainability and ESG initiatives",
                "Digital transformation projects",
                "Acquisition and merger financing",
                "Infrastructure development",
                "Research and development funding",
                "Supply chain optimization",
                "International market entry"
            ]),
            "notes": f"Professional financing for {random.choice(['strategic', 'operational', 'growth', 'sustainability'])} objectives with strong {random.choice(['market position', 'financial metrics', 'management team'])}."
        }
        loans.append(loan)
    
    return loans

def generate_deals(count=150):
    """Generate expanded deal data"""
    deals = []
    
    for i in range(count):
        value = random.randint(50000000, 2000000000)
        client_name = random.choice([c["name"] for c in COMPANIES])
        
        deal = {
            "dealId": f"DL-2025-{str(i+300).zfill(4)}",
            "dealName": f"{client_name} {random.choice(['Expansion', 'Modernization', 'Acquisition', 'Sustainability', 'Digital', 'Infrastructure'])} {random.choice(['Facility', 'Program', 'Initiative', 'Project'])}",
            "clientName": client_name,
            "dealValue": float(value),
            "currency": random.choice(["EUR", "USD", "GBP"]),
            "dealStatus": random.choice(["lead", "qualified", "proposal", "negotiation", "closedwon", "closedlost"]),
            "priority": random.choice(["low", "medium", "high", "critical"]),
            "expectedClosingDate": (datetime.now() + timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d"),
            "lastUpdated": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
            "dealType": random.choice(DEAL_TYPES),
            "sector": random.choice(SECTORS),
            "relationshipManager": random.choice(RELATIONSHIP_MANAGERS),
            "description": f"Comprehensive {random.choice(['financing', 'credit', 'investment'])} solution for {random.choice(['expansion', 'modernization', 'acquisition', 'sustainability', 'innovation'])} objectives in the {random.choice(SECTORS).lower()} sector."
        }
        deals.append(deal)
    
    return deals

def generate_activities(count=80):
    """Generate expanded GFD activities"""
    activities = []
    
    activity_types = ["credit", "origination", "distribution", "system"]
    activity_statuses = ["completed", "in_progress", "planned", "cancelled", "on_hold"]
    
    for i in range(count):
        activity_date = datetime.now() - timedelta(days=random.randint(1, 180))
        
        activity = {
            "activityId": f"ACT-2025-{str(i+1).zfill(5)}",
            "activityTitle": f"{random.choice(['Loan', 'Deal', 'Client', 'System'])} {random.choice(['Review', 'Analysis', 'Processing', 'Update', 'Assessment', 'Monitoring'])} - {random.choice(['Credit Approval', 'Due Diligence', 'Documentation', 'Compliance Check', 'Risk Assessment'])}",
            "activityDescription": f"Professional {random.choice(['analysis', 'review', 'assessment', 'processing'])} of {random.choice(['credit application', 'deal proposal', 'client portfolio', 'system integration'])} with comprehensive {random.choice(['due diligence', 'risk evaluation', 'compliance verification'])}.",
            "activityType": random.choice(activity_types),
            "activityStatus": random.choice(activity_statuses),
            "activityDate": activity_date.strftime("%Y-%m-%d"),
            "relatedEntityId": f"{random.choice(['LN-2025-', 'DL-2025-', 'CL-'])}{random.randint(1000, 9999)}",
            "relatedEntityType": random.choice(["Loan", "Deal", "Client", "System", "Portfolio"]),
            "createdBy": random.choice(RELATIONSHIP_MANAGERS),
            "priority": random.choice(["low", "medium", "high", "urgent"]),
            "notes": f"Activity completed within standard {random.choice(['processing', 'review', 'assessment'])} timeframes with {random.choice(['positive', 'satisfactory', 'excellent'])} outcomes."
        }
        activities.append(activity)
    
    return activities

def generate_performance_kpis(count=50):
    """Generate expanded performance KPI data"""
    kpis = []
    
    # Generate monthly data going back 50 months
    for i in range(count):
        report_date = datetime.now() - timedelta(days=30*i)
        
        # Add some realistic variance to metrics
        base_volume = 2800000000 + random.randint(-500000000, 500000000)
        base_clients = 850 + random.randint(-100, 200)
        base_deal_size = 45000000 + random.randint(-10000000, 20000000)
        
        kpi = {
            "reportDate": report_date.strftime("%Y-%m-%d"),
            "totalLoanVolume": float(base_volume),
            "activeClients": base_clients,
            "averageDealSize": float(base_deal_size),
            "portfolioGrowth": round(random.uniform(5.0, 18.0), 1),
            "revenueGenerated": float(random.randint(120000000, 200000000)),
            "defaultRate": round(random.uniform(0.5, 2.5), 1),
            "returnOnAssets": round(random.uniform(1.5, 3.5), 1),
            "periodType": "Monthly",
            "performanceSummary": f"Strong monthly performance with {random.choice(['robust', 'solid', 'steady', 'excellent'])} {random.choice(['growth', 'expansion', 'development'])} and {random.choice(['maintained', 'improved', 'enhanced'])} credit quality metrics."
        }
        kpis.append(kpi)
    
    return kpis

def generate_risk_metrics(count=50):
    """Generate expanded risk metrics data"""
    risks = []
    
    trends = ["stable", "improving", "deteriorating"]
    
    # Generate monthly data going back 50 months
    for i in range(count):
        report_date = datetime.now() - timedelta(days=30*i)
        
        risk = {
            "reportDate": report_date.strftime("%Y-%m-%d"),
            "totalRiskExposure": float(random.randint(2500000000, 4000000000)),
            "highRiskLoans": random.randint(8, 25),
            "averageCreditScore": round(random.uniform(700.0, 750.0), 1),
            "coverageRatio": round(random.uniform(1.5, 2.2), 2),
            "creditRiskPercentage": round(random.uniform(2.5, 4.5), 1),
            "marketRiskPercentage": round(random.uniform(1.8, 3.2), 1),
            "operationalRiskPercentage": round(random.uniform(1.5, 2.5), 1),
            "riskTrend": random.choice(trends),
            "riskSummary": f"Portfolio risk levels {random.choice(['remain within', 'demonstrate', 'show'])} acceptable parameters with {random.choice(['strong', 'adequate', 'improved'])} credit quality and {random.choice(['effective', 'robust', 'comprehensive'])} risk management."
        }
        risks.append(risk)
    
    return risks

def generate_workflow_metrics(count=50):
    """Generate expanded workflow metrics data"""
    workflows = []
    
    # Generate monthly data going back 50 months
    for i in range(count):
        report_date = datetime.now() - timedelta(days=30*i)
        
        active_workflows = random.randint(25, 45)
        
        workflow = {
            "reportDate": report_date.strftime("%Y-%m-%d"),
            "activeWorkflows": active_workflows,
            "avgProcessingTime": round(random.uniform(2.8, 4.5), 1),
            "completionRate": round(random.uniform(0.92, 0.98), 3),
            "exceptions": random.randint(5, 15),
            "originationWorkflows": random.randint(10, 20),
            "creditWorkflows": random.randint(8, 18),
            "distributionWorkflows": random.randint(5, 12),
            "originationProgress": round(random.uniform(65.0, 85.0), 1),
            "creditProgress": round(random.uniform(55.0, 75.0), 1),
            "distributionProgress": round(random.uniform(80.0, 95.0), 1)
        }
        workflows.append(workflow)
    
    return workflows

def main():
    """Generate all expanded sample data"""
    print("🚀 Generating 10x expanded Maestro GFD Cockpit sample data...")
    print("-" * 60)
    
    # Generate all data
    clients = generate_clients(50)
    loans = generate_loans(50)
    deals = generate_deals(150)
    activities = generate_activities(80)
    performance_kpis = generate_performance_kpis(50)
    risk_metrics = generate_risk_metrics(50)
    workflow_metrics = generate_workflow_metrics(50)
    
    # Create expanded data files
    datasets = [
        ("expanded-clients.json", {"items": clients}),
        ("expanded-loans.json", {"items": loans}),
        ("expanded-deals.json", {"items": deals}),
        ("expanded-activities.json", {"items": activities}),
        ("expanded-performance-kpis.json", {"items": performance_kpis}),
        ("expanded-risk-metrics.json", {"items": risk_metrics}),
        ("expanded-workflow-metrics.json", {"items": workflow_metrics}),
    ]
    
    for filename, data in datasets:
        with open(f"expanded_data/{filename}", "w") as f:
            json.dump(data, f, indent=2)
        print(f"✅ Generated {filename}: {len(data['items'])} records")
    
    total_records = sum(len(data['items']) for _, data in datasets)
    print("-" * 60)
    print(f"📊 Total expanded dataset: {total_records} records generated")
    print("🎉 Ready for API upload!")

if __name__ == "__main__":
    main()