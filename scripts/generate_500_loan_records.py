#!/usr/bin/env python3

import json
import random
from datetime import datetime, timedelta
import uuid

def generate_500_loan_records():
    """Generate 500 additional loan records with dates from today to 1 year past"""
    
    print("🏗️ Generating 500 additional loan records...")
    
    # Date range: Today (Sept 12, 2025) to 1 year ago (Sept 12, 2024)
    end_date = datetime(2025, 9, 12)
    start_date = datetime(2024, 9, 12)
    date_range_days = (end_date - start_date).days
    
    # Loan data templates
    loan_types = ["Term Loan", "Credit Line", "Equipment Financing", "Working Capital", "Trade Finance", "Project Finance"]
    loan_statuses = ["active", "pending", "approved", "completed"]
    currencies = ["EUR", "USD", "GBP", "CHF"]
    
    # French bank client names for realism
    client_names = [
        "Société Générale Corporate", "BNP Paribas Enterprise", "Crédit Agricole Business",
        "Natixis Commercial", "BPCE Enterprises", "La Banque Postale Pro",
        "Crédit Mutuel Business", "CIC Corporate", "Banque Palatine Pro",
        "Rothschild & Co", "Lazard Frères", "Oddo BHF",
        "TotalEnergies SE", "Sanofi SA", "LVMH Group", "L'Oréal SA", "Airbus SE",
        "Schneider Electric", "Vinci Group", "Bouygues Construction", "Thales Group",
        "Danone SA", "Peugeot SA", "Renault Group", "Saint-Gobain", "Michelin Group",
        "Orange SA", "Veolia Environment", "Engie SA", "Carrefour Group",
        "Atos SE", "Capgemini SE", "Dassault Systèmes", "Safran SA"
    ]
    
    relationship_managers = [
        "Marie Dubois", "Antoine Rousseau", "Sophie Moreau", "Philippe Garnier",
        "Catherine Durand", "Nicolas Bernard", "Isabelle Petit", "François Martin",
        "Sylvie Mercier", "Pierre Lefebvre", "Christine Simon", "Laurent Michel"
    ]
    
    sectors = [
        "Energy", "Healthcare", "Technology", "Manufacturing", "Retail", "Finance",
        "Transportation", "Telecommunications", "Construction", "Automotive",
        "Chemicals", "Food & Beverage", "Aerospace", "Utilities"
    ]
    
    loan_records = []
    
    for i in range(500):
        # Generate random date within the past year
        random_days = random.randint(0, date_range_days)
        loan_date = start_date + timedelta(days=random_days)
        
        # Generate loan amounts (realistic for corporate loans)
        loan_amount = random.choice([
            random.randint(500000, 2000000),      # 0.5M - 2M
            random.randint(2000000, 10000000),    # 2M - 10M  
            random.randint(10000000, 50000000),   # 10M - 50M
            random.randint(50000000, 200000000)   # 50M - 200M
        ])
        
        # Generate interest rate based on loan size and market conditions
        base_rate = random.uniform(2.5, 6.5)  # Current market rates
        
        # Generate maturity (months)
        maturity_months = random.choice([12, 24, 36, 48, 60, 84, 120, 180, 240])
        
        loan_record = {
            "loanId": f"LN-2024-{8000 + i:04d}",
            "clientName": random.choice(client_names),
            "loanAmount": float(loan_amount),
            "currency": random.choice(currencies),
            "loanType": random.choice(loan_types),
            "interestRate": round(base_rate, 2),
            "loanTerm": maturity_months,
            "loanStatus": random.choice(loan_statuses),
            "originationDate": loan_date.strftime("%Y-%m-%d"),
            "maturityDate": (loan_date + timedelta(days=maturity_months * 30)).strftime("%Y-%m-%d"),
            "relationshipManager": random.choice(relationship_managers),
            "sector": random.choice(sectors),
            "creditRating": random.choice(["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-"]),
            "loanPurpose": random.choice([
                "Working Capital", "Equipment Purchase", "Facility Expansion", 
                "Debt Refinancing", "Acquisition Financing", "Project Development",
                "Trade Finance", "Bridge Financing", "Construction Financing"
            ])
        }
        
        loan_records.append(loan_record)
        
        # Progress indicator
        if (i + 1) % 100 == 0:
            print(f"   📊 Generated {i + 1}/500 records...")
    
    # Save to file
    output_file = "generated_500_loans.json"
    with open(output_file, 'w') as f:
        json.dump(loan_records, f, indent=2)
    
    print(f"✅ Generated 500 loan records saved to {output_file}")
    
    # Show summary statistics
    total_volume = sum(record['loanAmount'] for record in loan_records)
    avg_amount = total_volume / len(loan_records)
    
    print(f"\n📊 Generated Loan Portfolio Summary:")
    print(f"   💰 Total Volume: €{total_volume:,.0f}")
    print(f"   📈 Average Loan: €{avg_amount:,.0f}")
    print(f"   📅 Date Range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    print(f"   🏦 Records Count: {len(loan_records)}")
    
    return loan_records

if __name__ == "__main__":
    generate_500_loan_records()