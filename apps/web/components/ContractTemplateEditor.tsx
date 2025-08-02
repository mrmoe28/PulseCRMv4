'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  Download, 
  Eye, 
  X,
  Calendar,
  DollarSign,
  Hash,
  Type,
  List,
  CheckSquare
} from 'lucide-react';
import { 
  ContractTemplate, 
  TemplateField, 
  populateTemplate, 
  validateTemplateFields 
} from '@/lib/contract-templates';

interface ContractTemplateEditorProps {
  template: ContractTemplate;
  onSave?: (values: Record<string, any>, content: string) => void;
  onClose?: () => void;
  initialValues?: Record<string, any>;
}

export default function ContractTemplateEditor({ 
  template, 
  onSave, 
  onClose,
  initialValues = {}
}: ContractTemplateEditorProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [content, setContent] = useState('');

  // Initialize default values
  useEffect(() => {
    const defaults: Record<string, any> = {};
    template.fields.forEach(field => {
      if (field.defaultValue && !values[field.id]) {
        defaults[field.id] = field.defaultValue;
      }
    });
    if (Object.keys(defaults).length > 0) {
      setValues(prev => ({ ...defaults, ...prev }));
    }
  }, [template]);

  // Update content when values change
  useEffect(() => {
    const populated = populateTemplate(template, values);
    setContent(populated);
  }, [values, template]);

  // Auto-calculate total cost for solar template
  useEffect(() => {
    if (template.id === 'solar-installation-agreement') {
      const projectSize = parseFloat(values.project_size || 0);
      const costPerWatt = parseFloat(values.cost_per_watt || 0);
      if (projectSize > 0 && costPerWatt > 0) {
        const total = (projectSize * 1000 * costPerWatt).toFixed(2);
        setValues(prev => ({ ...prev, total_cost: total }));
      } else if (!values.total_cost) {
        // Set a default value if total_cost is not set
        setValues(prev => ({ ...prev, total_cost: '0.00' }));
      }
    }
  }, [values.project_size, values.cost_per_watt, template.id]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  };

  const handleSave = () => {
    const validation = validateTemplateFields(template, values);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSave?.(values, content);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFieldIcon = (type: TemplateField['type']) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'number': return <Hash className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'select': return <List className="w-4 h-4" />;
      case 'checkbox': return <CheckSquare className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const renderField = (field: TemplateField) => {
    const error = errors[field.id];
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={values[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:border-orange-500 ${
              error ? 'border-red-500' : 'border-gray-700'
            }`}
          >
            <option value="">Select {field.name}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={values[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 ${
              error ? 'border-red-500' : 'border-gray-700'
            }`}
          />
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={values[field.id] || false}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-700 rounded focus:ring-orange-500"
            />
            <span className="text-gray-300">{field.placeholder || 'Check if applicable'}</span>
          </label>
        );
      
      default:
        return (
          <input
            type={field.type}
            value={values[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 ${
              error ? 'border-red-500' : 'border-gray-700'
            }`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-semibold text-white">{template.name}</h2>
              <p className="text-sm text-gray-400">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Fields */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {template.fields.map(field => (
                <div key={field.id} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    {getFieldIcon(field.type)}
                    {field.name}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.id] && (
                    <p className="text-xs text-red-500">{errors[field.id]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="w-1/2 border-l border-gray-700 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                  {content}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Fill in all required fields marked with *
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}