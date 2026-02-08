
export const SERVICE_TAXONOMY = [
  {
    id: "cat_labour_compliance",
    name: "Labour & Compliance Services",
    description: "Legal and regulatory compliance support",
    services: [
      { id: "serv_shop_act", name: "Shop Act Registration Maharashtra" },
      { id: "serv_labour_licence", name: "Labour Licence Consulting" },
      { id: "serv_factory_licence", name: "Factory Licence Renewal" },
      { id: "serv_contract_labour", name: "Contract Labour Licence Registration" },
      { id: "serv_labour_audit", name: "Labour Law Audit Services" },
      { id: "serv_min_wages", name: "Minimum Wages Compliance Support" },
      { id: "serv_posh", name: "POSH Compliance Consulting" },
      { id: "serv_standing_orders", name: "Standing Orders Certification" },
      { id: "serv_termination", name: "Employee Termination Legal Support" },
      { id: "serv_inspection", name: "Labour Inspection Assistance" }
    ]
  },
  {
    id: "cat_payroll_hr",
    name: "Payroll & HR Operations",
    description: "Managing people and payments efficiently",
    services: [
      { id: "serv_payroll_outsource", name: "Payroll Outsourcing" },
      { id: "serv_salary_process", name: "Salary Processing Services" },
      { id: "serv_pf_esic", name: "PF ESIC Filing Services" },
      { id: "serv_hr_policy", name: "HR Policy Drafting" },
      { id: "serv_handbook", name: "Employee Handbook Creation" },
      { id: "serv_leave_policy", name: "Leave Policy Setup" },
      { id: "serv_hr_audit", name: "HR Compliance Audit" },
      { id: "serv_attendance", name: "Attendance System Setup" }
    ]
  },
  {
    id: "cat_business_reg",
    name: "Business Registration & Licensing",
    description: "Setting up and legalizing your business",
    services: [
      { id: "serv_msme_reg", name: "MSME Registration" },
      { id: "serv_company_reg", name: "Company Registration Services" },
      { id: "serv_gst_reg", name: "GST Registration Help" },
      { id: "serv_trade_licence", name: "Trade Licence Renewal" },
      { id: "serv_prof_tax", name: "Professional Tax Registration Maharashtra" },
      { id: "serv_iec_code", name: "IEC Code Registration" },
      { id: "serv_fssai", name: "FSSAI Licence Consulting" }
    ]
  },
  {
    id: "cat_finance_accounting",
    name: "Finance & Accounting Support",
    description: "Bookkeeping, taxes, and financial filings",
    services: [
      { id: "serv_accounting_outsource", name: "Accounting Outsourcing" },
      { id: "serv_bookkeeping", name: "Bookkeeping Services" },
      { id: "serv_tds_filing", name: "TDS Filing Services" },
      { id: "serv_roc_compliance", name: "ROC Compliance Support" },
      { id: "serv_annual_compliance", name: "Annual Company Compliance Filing" }
    ]
  },
  {
    id: "cat_hiring_recruitment",
    name: "HR Hiring & Recruitment Operations",
    description: "Finding and onboarding the right talent",
    services: [
      { id: "serv_hr_consulting", name: "HR Consulting for SMEs" },
      { id: "serv_recruitment_support", name: "Recruitment Agency Support" },
      { id: "serv_hr_outsource", name: "HR Outsourcing Services" },
      { id: "serv_onboarding_setup", name: "Employee Onboarding Setup" }
    ]
  },
  {
    id: "cat_documentation_legal",
    name: "Documentation & Legal Drafting",
    description: "Contracts, NDAs, and legal agreements",
    services: [
      { id: "serv_employment_contract", name: "Employment Contract Drafting" },
      { id: "serv_nda_drafting", name: "NDA Agreement Drafting" },
      { id: "serv_vendor_agreement", name: "Vendor Agreement Drafting" },
      { id: "serv_legal_notice", name: "Legal Notice Drafting" }
    ]
  },
  {
    id: "cat_industrial_mfg",
    name: "Industrial & Manufacturing Compliance",
    description: "Specialized factory and industrial support",
    services: [
      { id: "serv_factory_audit", name: "Factory Audit Consulting" },
      { id: "serv_safety_audit", name: "Safety Compliance Audit" },
      { id: "serv_iso_cert", name: "ISO Certification Consulting" },
      { id: "serv_pollution_licence", name: "Pollution Control Licence Consulting" },
      { id: "serv_welfare_compliance", name: "Labour Welfare Compliance" }
    ]
  }
];

/**
 * Robustly resolves a service ID or object into its human-readable name.
 */
export function getServiceName(service: any) {
  const serviceId = typeof service === 'string' ? service : service?.id;
  if (!serviceId) return "Unspecified Service";

  for (const cat of SERVICE_TAXONOMY) {
    const found = cat.services.find(s => s.id === serviceId);
    if (found) return found.name;
  }
  
  // Fallback if ID looks like a formatted string but not found in current taxonomy
  if (typeof serviceId === 'string' && serviceId.startsWith('serv_')) {
    return serviceId.replace('serv_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return "Specialized Expert Service";
}

export function getServiceNames(serviceIds: any[] | undefined) {
  if (!serviceIds || serviceIds.length === 0) return "No specific services selected";
  return serviceIds.map(id => getServiceName(id)).join(", ");
}

export function getCategoryName(categoryId: string) {
  const cat = SERVICE_TAXONOMY.find(c => c.id === categoryId);
  return cat ? cat.name : "Operations & Compliance";
}
