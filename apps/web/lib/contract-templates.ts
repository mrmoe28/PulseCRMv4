export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'signature' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select type
  defaultValue?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: TemplateField[];
  content: string; // Template content with {{field_id}} placeholders
  signatureFields?: {
    id: string;
    label: string;
    required: boolean;
  }[];
}

// Solar Installation Agreement Template
export const SOLAR_INSTALLATION_TEMPLATE: ContractTemplate = {
  id: 'solar-installation-agreement',
  name: 'Solar Installation Agreement',
  category: 'contracts',
  description: 'Standard solar panel installation contract template',
  fields: [
    // Company Information
    {
      id: 'company_name',
      name: 'Company Name',
      type: 'text',
      defaultValue: 'EKO SOLAR.LLC',
      required: true
    },
    {
      id: 'company_address',
      name: 'Company Address',
      type: 'text',
      defaultValue: '1018 Ferndale st. Stone Mountain, Ga, 30083',
      required: true
    },
    {
      id: 'company_license',
      name: 'License Number',
      type: 'text',
      defaultValue: 'EN215292',
      required: true
    },
    
    // Customer Information
    {
      id: 'customer_name',
      name: 'Customer Name',
      type: 'text',
      placeholder: 'Enter customer full name',
      required: true
    },
    {
      id: 'customer_address',
      name: 'Installation Address',
      type: 'text',
      placeholder: 'Enter installation address',
      required: true
    },
    {
      id: 'property_owner',
      name: 'Property Owner',
      type: 'text',
      placeholder: 'Name of property owner',
      required: true
    },
    
    // Project Details
    {
      id: 'project_size',
      name: 'System Size (kWh)',
      type: 'number',
      placeholder: '6.000',
      required: true,
      validation: {
        min: 1,
        max: 100,
        message: 'System size must be between 1 and 100 kWh'
      }
    },
    {
      id: 'cost_per_watt',
      name: 'Cost per Watt ($)',
      type: 'number',
      placeholder: '0.30',
      required: true,
      validation: {
        min: 0.01,
        max: 10,
        message: 'Cost per watt must be between $0.01 and $10'
      }
    },
    {
      id: 'total_cost',
      name: 'Total Project Cost ($)',
      type: 'number',
      placeholder: '1800.00',
      defaultValue: '0.00',
      required: true
    },
    
    // Equipment
    {
      id: 'panel_quantity',
      name: 'Number of Panels',
      type: 'number',
      placeholder: '15',
      required: true
    },
    {
      id: 'inverter_type',
      name: 'Inverter Type',
      type: 'text',
      placeholder: 'Solar Edge',
      required: true
    },
    {
      id: 'inverter_quantity',
      name: 'Number of Inverters',
      type: 'number',
      defaultValue: '1',
      required: true
    },
    
    // Timeline
    {
      id: 'start_days',
      name: 'Start Within (Days)',
      type: 'number',
      defaultValue: '30',
      required: true
    },
    {
      id: 'completion_days',
      name: 'Complete Within (Days)',
      type: 'number',
      defaultValue: '3',
      required: true
    },
    
    // Warranty
    {
      id: 'warranty_years',
      name: 'Warranty Period (Years)',
      type: 'number',
      defaultValue: '1',
      required: true
    },
    {
      id: 'roof_warranty_radius',
      name: 'Roof Warranty Radius (Inches)',
      type: 'number',
      defaultValue: '5',
      required: true
    },
    
    // Agreement Date
    {
      id: 'agreement_date',
      name: 'Agreement Date',
      type: 'date',
      required: true
    }
  ],
  signatureFields: [
    {
      id: 'contractor_signature',
      label: 'Contractor Signature',
      required: true
    },
    {
      id: 'owner_signature',
      label: 'Owner Signature',
      required: true
    },
    {
      id: 'co_owner_signature',
      label: 'Co-Owner Signature (if applicable)',
      required: false
    }
  ],
  content: `SOLAR INSTALLATION AGREEMENT

This Solar Installation Agreement (the "Agreement") is entered into on {{agreement_date}} between {{company_name}}, a corporation organized and existing under the laws of the state of GEORGIA, with its principal office located at {{company_address}}, referred to herein as "Contractor", and {{customer_name}}, referred to herein as "Owner".

WHEREAS, Owner desires Contractor to install a solar panel system on Owner's property located at {{customer_address}};

WHEREAS, {{property_owner}} is/are the true and lawful Owner(s) of the Property;

WHEREAS, the solar panel system (the "System") specifications are as follows:
- System Size: {{project_size}} kWh
- Number of Panels: {{panel_quantity}}
- Inverter Type: {{inverter_type}}
- Number of Inverters: {{inverter_quantity}}

NOW, THEREFORE, for and in consideration of the mutual covenants contained in this Agreement, the Parties agree as follows:

1. INSTALLATION COST
   Total Project Cost: ${{total_cost}}
   Cost Breakdown: {{project_size}} kWh × ${{cost_per_watt}} per watt = ${{total_cost}}

2. TIMELINE
   - Work shall commence within {{start_days}} days of contract execution
   - Installation shall be completed within {{completion_days}} days of commencement

3. WARRANTY
   - Contractor provides {{warranty_years}} year(s) warranty on parts and labor
   - Roof penetrations warranted within {{roof_warranty_radius}} inch radius

4. LICENSE
   Contractor is licensed in Georgia, License Number: {{company_license}}

[Additional standard terms and conditions would follow...]`
};

// Roofing Contract Template
export const ROOFING_CONTRACT_TEMPLATE: ContractTemplate = {
  id: 'roofing-contract',
  name: 'Roofing Contract',
  category: 'contracts',
  description: 'Standard roofing installation/repair contract',
  fields: [
    {
      id: 'project_type',
      name: 'Project Type',
      type: 'select',
      options: ['New Installation', 'Repair', 'Replacement', 'Maintenance'],
      required: true
    },
    {
      id: 'roof_area',
      name: 'Roof Area (sq ft)',
      type: 'number',
      required: true
    },
    {
      id: 'material_type',
      name: 'Material Type',
      type: 'select',
      options: ['Asphalt Shingles', 'Metal', 'Tile', 'Flat/Membrane', 'Other'],
      required: true
    },
    // ... additional fields
  ],
  signatureFields: [
    {
      id: 'contractor_signature',
      label: 'Contractor Signature',
      required: true
    },
    {
      id: 'customer_signature',
      label: 'Customer Signature',
      required: true
    }
  ],
  content: `ROOFING CONTRACT\n\nProject Type: {{project_type}}\nRoof Area: {{roof_area}} sq ft\nMaterial: {{material_type}}\n\n[Contract terms...]`
};

// Service Agreement Template
export const SERVICE_AGREEMENT_TEMPLATE: ContractTemplate = {
  id: 'service-agreement',
  name: 'Service & Maintenance Agreement',
  category: 'contracts',
  description: 'Ongoing service and maintenance agreement',
  fields: [
    {
      id: 'service_type',
      name: 'Service Type',
      type: 'select',
      options: ['Solar Maintenance', 'Roof Maintenance', 'General Maintenance'],
      required: true
    },
    {
      id: 'service_frequency',
      name: 'Service Frequency',
      type: 'select',
      options: ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'],
      required: true
    },
    {
      id: 'contract_duration',
      name: 'Contract Duration',
      type: 'select',
      options: ['1 Year', '2 Years', '3 Years', '5 Years'],
      required: true
    },
    {
      id: 'monthly_fee',
      name: 'Monthly Fee ($)',
      type: 'number',
      required: true
    }
  ],
  signatureFields: [
    {
      id: 'service_provider_signature',
      label: 'Service Provider Signature',
      required: true
    },
    {
      id: 'customer_signature',
      label: 'Customer Signature',
      required: true
    }
  ],
  content: `SERVICE & MAINTENANCE AGREEMENT\n\nService Type: {{service_type}}\nFrequency: {{service_frequency}}\nDuration: {{contract_duration}}\nMonthly Fee: ${{monthly_fee}}\n\n[Agreement terms...]`
};

// All templates
export const CONTRACT_TEMPLATES = [
  SOLAR_INSTALLATION_TEMPLATE,
  ROOFING_CONTRACT_TEMPLATE,
  SERVICE_AGREEMENT_TEMPLATE
];

// Template helper functions
export function populateTemplate(template: ContractTemplate, values: Record<string, any>): string {
  let content = template.content;
  
  // First, find all placeholders in the template
  const placeholderRegex = /{{(\w+)}}/g;
  const placeholders = content.match(placeholderRegex) || [];
  
  // Replace all placeholders with values or empty string
  placeholders.forEach(placeholder => {
    const key = placeholder.replace(/{{|}}/g, '');
    const value = values[key] || '';
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, value);
  });
  
  return content;
}

export function validateTemplateFields(template: ContractTemplate, values: Record<string, any>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  template.fields.forEach(field => {
    const value = values[field.id];
    
    // Check required fields
    if (field.required && !value) {
      errors[field.id] = `${field.name} is required`;
      return;
    }
    
    // Validate based on type and rules
    if (value && field.validation) {
      if (field.type === 'number') {
        const numValue = parseFloat(value);
        if (field.validation.min !== undefined && numValue < field.validation.min) {
          errors[field.id] = field.validation.message || `${field.name} must be at least ${field.validation.min}`;
        }
        if (field.validation.max !== undefined && numValue > field.validation.max) {
          errors[field.id] = field.validation.message || `${field.name} must be at most ${field.validation.max}`;
        }
      }
      
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors[field.id] = field.validation.message || `${field.name} format is invalid`;
        }
      }
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}