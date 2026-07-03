
export const SERVICE_TAXONOMY = [
  {
    id: "cat_labour_compliance",
    name: "Labour Law & Compliance",
    description: "Statutory compliance, labour audits, and inspection-ready support",
    services: [
      { id: "serv_labour_licence", name: "Labour Licence Consulting" },
      { id: "serv_factory_licence", name: "Factory Licence Renewal" },
      { id: "serv_contract_labour", name: "Contract Labour Licence Registration" },
      { id: "serv_labour_audit", name: "Labour Law Audit Services" },
      { id: "serv_min_wages", name: "Minimum Wages Compliance Support" },
      { id: "serv_posh", name: "POSH Compliance Consulting" },
      { id: "serv_standing_orders", name: "Standing Orders Certification" },
      { id: "serv_inspection", name: "Labour Inspection Assistance" }
    ]
  },
  {
    id: "cat_payroll_statutory",
    name: "Payroll & Statutory Filings",
    description: "Managed payroll processing, filings, and statutory contributions",
    services: [
      { id: "serv_payroll_outsource", name: "Payroll Outsourcing" },
      { id: "serv_salary_process", name: "Salary Processing Services" },
      { id: "serv_pf_esic", name: "PF & ESIC Filing Services" },
      { id: "serv_tds_filing", name: "TDS Return Filing" },
      { id: "serv_prof_tax", name: "Professional Tax Registration Support" },
      { id: "serv_annual_compliance", name: "Annual Statutory Compliance Filing" },
      { id: "serv_gst_reg", name: "GST Returns & Compliance" }
    ]
  },
  {
    id: "cat_hrms_services",
    name: "HRMS & Workforce Operations",
    description: "HR systems, employee lifecycle management, and workforce automation",
    services: [
      { id: "serv_hrms_implementation", name: "HRMS Implementation" },
      { id: "serv_attendance", name: "Attendance & Shift Management" },
      { id: "serv_leave_policy", name: "Leave & Policy Setup" },
      { id: "serv_onboarding_setup", name: "Employee Onboarding Systems" },
      { id: "serv_hr_audit", name: "HR Compliance Audit" },
      { id: "serv_hr_policy", name: "HR Policy Drafting" }
    ]
  },
  {
    id: "cat_employee_documents",
    name: "Employee Documentation",
    description: "Workplace policy and employee document drafting",
    services: [
      { id: "serv_employment_contract", name: "Employment Contract Drafting" },
      { id: "serv_nda_drafting", name: "NDA & Confidentiality Agreements" },
      { id: "serv_vendor_agreement", name: "Service & Vendor Agreement Drafting" },
      { id: "serv_termination", name: "Termination & Severance Support" }
    ]
  }
];

/**
 * Robustly resolves a service ID or object into its human-readable name.
 * Handles cases where the database might store the name string directly.
 */
export function getServiceName(service: any) {
  const serviceId = typeof service === 'string' ? service : service?.id;
  if (!serviceId) return "Unspecified Service";

  // 1. Try to match against internal taxonomy IDs
  for (const cat of SERVICE_TAXONOMY) {
    const found = cat.services.find(s => s.id === serviceId);
    if (found) return found.name;
  }
  
  // 2. If it's a string and doesn't look like an ID (doesn't start with serv_ or cat_), 
  // it's likely already a human-readable name from manual entry.
  if (typeof serviceId === 'string' && !serviceId.startsWith('serv_') && !serviceId.startsWith('cat_')) {
    return serviceId;
  }

  // 3. Fallback: If it's a formatted ID string, try to prettify it
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
