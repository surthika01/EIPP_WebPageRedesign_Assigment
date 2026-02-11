import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from './components/form/Input';
import { Select } from './components/form/Select';
import { Switch } from './components/form/Switch';
import { Section } from './components/form/Section';
import { 
  Save, Plus, Copy, Trash2, Download, Printer, FileText, 
  MessageSquare, AlertCircle, CheckCircle2, FileJson, FileSpreadsheet,
  RefreshCw, ChevronDown
} from 'lucide-react';
import { cn } from './utils/cn';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const INITIAL_STATE = {
  id: '',
  type: 'Document',
  name: '',
  description: '',
  objectNaming: 'empty',
  propertyStore: '',
  sensitive: false,
  disableObjectCreation: false,
  disableManualCreation: false,
  allowConcurrentEditing: false,
  notes: '',
  inputPackage: '',
  retentionPolicy: '',
  icon: '',
  createFolders: '',
  exclusiveFolder: 'no',
  listInfo: '',
  handler: '',
  insertProc: '',
  deleteProc: '',
  searchScreen: '',
  resultScreen: '',
  treeAction: ''
};

export default function ConfigurationForm() {
  // Mock path for now to match user request "Home > Configuration > Document Categories"
  // In a real dynamic app this would come from the route
  const currentPath = ['Home', 'Configuration', 'Category'];

  const [formData, setFormData] = useState({
    ...INITIAL_STATE,
    id: 'CAT-' + Math.floor(Math.random() * 10000)
  });
  const [savedRecords, setSavedRecords] = useState([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [status, setStatus] = useState(null);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('eipp_records');
    if (stored) {
      try {
        setSavedRecords(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored records");
      }
    }
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleNew = () => {
    setFormData({ ...INITIAL_STATE, id: 'CAT-' + Math.floor(Math.random() * 10000) });
    showStatus('info', "New form template loaded");
  };

  const handleSave = () => {
    if (!formData.name) {
      showStatus('error', "Name is required to save");
      return;
    }
    const updated = [...savedRecords.filter(r => r.id !== formData.id), formData];
    setSavedRecords(updated);
    localStorage.setItem('eipp_records', JSON.stringify(updated));
    showStatus('success', "Record saved to local storage");
  };

  const handleDelete = () => {
    const updated = savedRecords.filter(r => r.id !== formData.id);
    setSavedRecords(updated);
    localStorage.setItem('eipp_records', JSON.stringify(updated));
    handleNew();
    showStatus('info', "Record deleted");
  };

  const handleCopy = () => {
    const copied = { ...formData, id: formData.id + '-COPY', name: formData.name + ' (Copy)' };
    setFormData(copied);
    showStatus('info', "Details copied to a new record");
  };

  const handlePrint = () => {
    window.print();
  };

  const getExportData = () => {
    const labels = {
      id: "Category ID",
      name: "Category Name",
      type: "Resource Type",
      description: "Description",
      objectNaming: "Naming Convention",
      propertyStore: "Property Storage",
      sensitive: "Sensitive Data",
      disableObjectCreation: "Creation Disabled",
      disableManualCreation: "Manual Entry Restricted",
      allowConcurrentEditing: "Concurrent Editing",
      notes: "Internal Notes",
      inputPackage: "Input Package Path",
      retentionPolicy: "Retention Cycle",
      icon: "Icon Set",
      createFolders: "Folder Creation Pattern",
      exclusiveFolder: "Locked to Scope",
      listInfo: "System List Binding",
      insertProc: "Entry Logic Proc",
      deleteProc: "Exit Logic Proc",
      searchScreen: "Search Scope",
      resultScreen: "Results View",
      treeAction: "Context Action"
    };

    const rows = Object.entries(formData).map(([key, value]) => {
      let displayValue = value;
      if (typeof value === 'boolean') displayValue = value ? "Yes" : "No";
      if (value === '' || value === null || value === undefined) displayValue = "N/A";
      return { label: labels[key] || key, value: String(displayValue) };
    });

    return rows;
  };

  const handleExport = (format) => {
    const data = getExportData();
    const fileName = `Category_Report_${formData.id}`;

    if (format === 'xlsx' || format === 'csv') {
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(data.map(row => ({
        "Field Label": row.label,
        "Value": row.value
      })));

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Configuration");

      // Write file
      XLSX.writeFile(wb, `${fileName}.${format}`);
      showStatus('success', `Exported as ${format.toUpperCase()}`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 100);
      doc.text("AURORA ENTERPRISE", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Configuration Management Report", 14, 28);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

      // Table
      autoTable(doc, {
        head: [['Field', 'Value']],
        body: data.map(row => [row.label, row.value]),
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [60, 60, 150] },
        styles: { fontSize: 10, cellPadding: 3 }
      });

      doc.save(`${fileName}.pdf`);
      showStatus('success', 'Exported as PDF Document');
    }

    setIsExportOpen(false);
  };

  return (
    <div className="bg-gray-50 p-6 md:p-8 relative min-h-full">
      <PrintLayout formData={formData} currentPath={currentPath} />
      
      {/* Main UI Container */}
      <div className="max-w-7xl mx-auto space-y-6 print:hidden">
        
        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm mb-4 overflow-hidden whitespace-nowrap">
          {currentPath.map((part, idx) => (
            <div key={part + idx} className="flex items-center gap-2">
              <Link 
                to={idx === 0 ? '/' : '#'} 
                className={cn(
                  "hover:text-indigo-600 transition-colors uppercase tracking-wider text-[10px] font-bold",
                  idx === currentPath.length - 1 ? "text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded" : "text-gray-400 hover:bg-gray-100 px-2 py-0.5 rounded"
                )}
              >
                {part}
              </Link>
              {idx < currentPath.length - 1 && <span className="text-gray-300">/</span>}
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white p-2 rounded-xl shadow-md border border-gray-200 mb-8 flex flex-wrap gap-2 items-center sticky top-0 z-20">
          <ToolbarButton icon={<Plus size={18} />} label="Add" onClick={handleNew} />
          <ToolbarButton icon={<Save size={18} />} label="Save" onClick={handleSave} className="text-emerald-600 hover:bg-emerald-50" />
          <ToolbarButton icon={<Copy size={18} />} label="Copy" onClick={handleCopy} />
          <ToolbarButton icon={<Trash2 size={18} />} label="Delete" onClick={handleDelete} className="text-rose-600 hover:bg-rose-50" />
          
          <div className="h-8 w-px bg-gray-100 mx-2" />
          
          <div className="relative group">
            <ToolbarButton 
              icon={<Download size={18} />} 
              label="Export" 
              onClick={() => setIsExportOpen(!isExportOpen)} 
              active={isExportOpen}
            />
            {isExportOpen && (
              <div className="absolute left-0 mt-3 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in duration-150">
                <ExportItem icon={<FileSpreadsheet className="text-green-600" size={16} />} label="Export to Excel" onClick={() => handleExport('xlsx')} />
                <ExportItem icon={<FileJson className="text-orange-500" size={16} />} label="Export as CSV" onClick={() => handleExport('csv')} />
                <ExportItem icon={<FileText className="text-red-500" size={16} />} label="Export PDF Report" onClick={() => handleExport('pdf')} />
              </div>
            )}
          </div>
          
          <ToolbarButton icon={<Printer size={18} />} label="Print" onClick={handlePrint} />
          
          <div className="ml-auto hidden xl:flex items-center gap-4 pr-3">
             <div className="relative">
                <input 
                  type="text"
                  placeholder="Filter local storage..."
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-gray-50/50 hover:bg-white transition-all shadow-inner"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                </div>
             </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Section 1: Get Started */}
          <Section title="1. Get Started" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Input 
                label="Identifier (ID)" 
                value={formData.id} 
                onChange={(e) => handleChange('id', e.target.value)} 
              />
              <Input 
                label="Resource Type" 
                value={formData.type} 
                disabled 
                className="bg-gray-50/50"
              />
              <Input 
                label="Full Name" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Required field" 
                error={!formData.name ? "Name is required" : ""}
              />
              <Input 
                label="Description" 
                value={formData.description} 
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Optional details" 
              />
              <Select 
                label="Naming Convention" 
                value={formData.objectNaming}
                onChange={(e) => handleChange('objectNaming', e.target.value)}
                options={[
                  { label: "EmptyName", value: "empty" },
                  { label: "Auto-Generate", value: "auto" },
                  { label: "System Default", value: "sys" }
                ]} 
              />
              <Select 
                label="Property Storage" 
                value={formData.propertyStore}
                onChange={(e) => handleChange('propertyStore', e.target.value)}
                options={[
                  { label: "Default Store", value: "" },
                  { label: "High Speed Cache", value: "cache" },
                  { label: "Persistent Disk", value: "disk" }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Switch 
                label="Sensitive Information" 
                checked={formData.sensitive} 
                onChange={(e) => handleChange('sensitive', e.target.checked)} 
              />
              <Switch 
                label="Disable Creation" 
                checked={formData.disableObjectCreation}
                onChange={(e) => handleChange('disableObjectCreation', e.target.checked)}
              />
              <Switch 
                label="Prevent Manual Entry" 
                checked={formData.disableManualCreation}
                onChange={(e) => handleChange('disableManualCreation', e.target.checked)}
              />
              <Switch 
                label="Allow Multi-Edit" 
                checked={formData.allowConcurrentEditing}
                onChange={(e) => handleChange('allowConcurrentEditing', e.target.checked)}
              />
            </div>
          </Section>

          {/* Populated Collapsed Sections */}
          <Section title="Configuration: Properties">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input label="Validation Rules" placeholder="Regex or logic string" />
              <Select label="Encryption Type" options={[{label:'AES-256', value:'aes'},{label:'RSA', value:'rsa'}]} />
              <Input label="Default Value" placeholder="Initial state" />
            </div>
          </Section>

          <Section title="Configuration: Packages">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
               <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex gap-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900">Module Association</h4>
                    <p className="text-xs text-indigo-600 mt-1">Select the deployment package this category belongs to for version control.</p>
                  </div>
               </div>
               <Select label="Active Package" options={[{label:'Global_Core_v1.0', value:'core'}, {label:'Ext_Charts_v0.9', value:'charts'}]} />
             </div>
          </Section>

          <Section title="Configuration: Screens">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <ScreenCard title="Input Form" subtitle="Standard Edit" />
               <ScreenCard title="Search Result" subtitle="Grid View" />
               <ScreenCard title="Detail View" subtitle="Read-Only" />
               <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-gray-400 hover:text-indigo-600 group">
                  <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-wider">Add screen</span>
               </button>
            </div>
          </Section>

          <Section title="Configuration: Object Events">
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500 italic text-center">
              No object events configured.
            </div>
          </Section>

          <Section title="Configuration: Event Handlers">
             <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500 italic text-center">
              No event handlers configured.
            </div>
          </Section>

          {/* Section 2: Essentials */}
          <Section title="2. Essentials" defaultOpen={true}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left Column */}
              <div className="space-y-6">
                <FormGroup label="Input Package">
                  <Input label="" value={formData.inputPackage} onChange={e => handleChange('inputPackage', e.target.value)} placeholder="e.g. /sys/apps/categories" />
                </FormGroup>
                <FormGroup label="Retention Policy">
                  <Select label="" value={formData.retentionPolicy} onChange={e => handleChange('retentionPolicy', e.target.value)} options={[{label: "Standard (36 Months)", value:"3"}, {label: "Extended (10 Years)", value:"10"}, {label: "Archive Only", value:"arc"}]} />
                </FormGroup>
                <FormGroup label="Icon">
                  <Select label="" value={formData.icon} onChange={e => handleChange('icon', e.target.value)} options={[{label: "Default Folder", value:"f"}, {label: "Document Stack", value:"d"}, {label: "Pie Chart", value:"c"}]} />
                </FormGroup>
                <FormGroup label="Create Folders In Folder">
                  <Input label="" value={formData.createFolders} onChange={e => handleChange('createFolders', e.target.value)} placeholder="Hierarchy pattern" />
                </FormGroup>
                <FormGroup label="Exclusive to Folder...">
                  <Select label="" value={formData.exclusiveFolder} onChange={e => handleChange('exclusiveFolder', e.target.value)} options={[{label: "Global Accessibility", value:"no"}, {label: "Local Restricted", value:"yes"}]} />
                </FormGroup>
                <FormGroup label="List Info">
                  <Select label="" value={formData.listInfo} onChange={e => handleChange('listInfo', e.target.value)} options={[{label: "Master Document Categories", value:"master"}]} />
                </FormGroup>
                <FormGroup label="Category Type Handler">
                  <Select label="" value={formData.handler} onChange={e => handleChange('handler', e.target.value)} options={[{label: "Default Handler", value:"default"}]} />
                </FormGroup>
              </div>

              {/* Right Column */}
              <div className="space-y-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Procedures</span>
                    <RefreshCw size={14} className="text-gray-300 group-hover:rotate-180 transition-transform duration-700" />
                  </div>
                   <div className="space-y-5">
                      <FormGroup label="Insert Procedure">
                        <Select label="" value={formData.insertProc} onChange={e => handleChange('insertProc', e.target.value)} options={[{label: "val_proc_validate", value:"v"}, {label: "sys_proc_init", value:"i"}]} />
                      </FormGroup>
                      <FormGroup label="Delete Procedure">
                        <Select label="" value={formData.deleteProc} onChange={e => handleChange('deleteProc', e.target.value)} options={[{label: "sys_proc_cleanup", value:"c"}]} />
                      </FormGroup>
                   </div>
                </div>

                 <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <AlertCircle size={48} className="text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Settings</span>
                  </div>
                   <div className="space-y-5">
                      <FormGroup label="Search Screen" dark>
                        <Select label="" value={formData.searchScreen} onChange={e => handleChange('searchScreen', e.target.value)} options={[{label: "Wide Filter View", value:"w"}]} className="bg-slate-800 border-slate-700 text-white" />
                      </FormGroup>
                      <FormGroup label="Result Screen" dark>
                        <Select label="" value={formData.resultScreen} onChange={e => handleChange('resultScreen', e.target.value)} options={[{label: "Compact Info List", value:"c"}]} className="bg-slate-800 border-slate-700 text-white" />
                      </FormGroup>
                      <FormGroup label="Tree Action" dark>
                        <Select label="" value={formData.treeAction} onChange={e => handleChange('treeAction', e.target.value)} options={[{label: "Open in Current", value:"curr"}]} className="bg-slate-800 border-slate-700 text-white" />
                      </FormGroup>
                   </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Feedback / Notes Section */}
          <Section title="Internal Notes & Documentation" defaultOpen={true}>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <label className="text-sm font-black uppercase tracking-wider text-gray-400 flex items-center gap-3">
                    <MessageSquare size={16} className="text-indigo-600" />
                    Configuration Context
                  </label>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">{formData.notes.length} chars</span>
                </div>
                <textarea 
                  rows={5}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Record implementation notes, audit trail details, or feedback here... All data is saved to local storage."
                  className="w-full rounded-2xl border border-gray-200 p-6 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white shadow-inner"
                />
             </div>
          </Section>
        </div>
      </div>
      
      {/* Scroll to top fab */}
      <button 
        onClick={() => document.querySelector('main')?.scrollTo({top: 0, behavior: 'smooth'})}
        className="fixed bottom-8 right-8 w-12 h-12 bg-white border border-gray-200 shadow-2xl rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:scale-110 transition-all print:hidden z-50"
      >
        <ChevronDown size={20} className="rotate-180" />
      </button>

      {/* Toast Notification */}
      {status && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 print:hidden">
          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border text-sm font-bold backdrop-blur-md",
            status.type === 'success' && "bg-emerald-900/90 text-emerald-100 border-emerald-800",
            status.type === 'info' && "bg-slate-900/90 text-slate-100 border-slate-800",
            status.type === 'error' && "bg-rose-900/90 text-rose-100 border-rose-800"
          )}>
            {status.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}
            {status.type === 'info' && <AlertCircle size={18} className="text-blue-400" />}
            {status.type === 'error' && <AlertCircle size={18} className="text-rose-400" />}
            <span>{status.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PrintLayout({ formData, currentPath }) {
  const formatDate = (date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderValue = (val) => {
    if (typeof val === 'boolean') return val ? 'YES' : 'NO';
    if (val === '' || val === null || val === undefined) return <span className="text-gray-400">N/A</span>;
    return val;
  };

  return (
    <div className="hidden print:block p-10 bg-white text-gray-900 font-serif overflow-visible h-auto">
      <div className="flex justify-between items-start border-b-2 border-indigo-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tighter">AURORA ENTERPRISE</h1>
          <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Configuration Management Solution</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold uppercase">Configuration Report</p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(new Date())}</p>
        </div>
      </div>

      <div className="mb-10 p-6 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
         <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Hierarchy Path</p>
            <p className="text-sm font-bold text-indigo-900">{currentPath.join(' / ')}</p>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Category Status</p>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-200">ACTIVE</span>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-10">
        <PrintSection title="1. PRIMARY IDENTIFICATION">
          <PrintField label="Category ID" value={renderValue(formData.id)} />
          <PrintField label="Resource Type" value={renderValue(formData.type)} />
          <PrintField label="Full Name" value={renderValue(formData.name)} />
          <PrintField label="Description" value={renderValue(formData.description)} />
        </PrintSection>

        <PrintSection title="2. EXECUTION SETTINGS">
          <PrintField label="Naming Conv." value={renderValue(formData.objectNaming)} />
          <PrintField label="Prop Storage" value={renderValue(formData.propertyStore)} />
          <PrintField label="Sensitive" value={renderValue(formData.sensitive)} />
          <PrintField label="Creation Disabled" value={renderValue(formData.disableObjectCreation)} />
          <PrintField label="Manual Restricted" value={renderValue(formData.disableManualCreation)} />
          <PrintField label="Multi-Edit" value={renderValue(formData.allowConcurrentEditing)} />
        </PrintSection>

        <PrintSection title="3. ESSENTIALS & CYCLE">
          <PrintField label="Input Package" value={renderValue(formData.inputPackage)} />
          <PrintField label="Retention Cycle" value={renderValue(formData.retentionPolicy)} />
          <PrintField label="Icon Set" value={renderValue(formData.icon)} />
          <PrintField label="Folder Pattern" value={renderValue(formData.createFolders)} />
          <PrintField label="Scope Lock" value={renderValue(formData.exclusiveFolder)} />
          <PrintField label="List Binding" value={renderValue(formData.listInfo)} />
        </PrintSection>

        <PrintSection title="4. LOGIC & ENVIRONMENT">
          <PrintField label="Entry Logic" value={renderValue(formData.insertProc)} />
          <PrintField label="Exit Logic" value={renderValue(formData.deleteProc)} />
          <PrintField label="Search Scope" value={renderValue(formData.searchScreen)} />
          <PrintField label="Results View" value={renderValue(formData.resultScreen)} />
          <PrintField label="Context Action" value={renderValue(formData.treeAction)} />
        </PrintSection>
      </div>

      <div className="mt-12">
        <PrintSection title="CONFIGURATOR NOTES" fullWidth>
           <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm italic min-h-[150px]">
              {formData.notes ? formData.notes : <span className="text-gray-300">No additional configuration notes provided for this record.</span>}
           </div>
        </PrintSection>
      </div>

      <div className="fixed bottom-10 left-10 right-10 flex justify-between items-center text-[10px] font-bold text-gray-300 uppercase tracking-widest border-t border-gray-100 pt-6">
         <span>Aurora Config Gen v2.4</span>
         <span>Page 1 of 1</span>
         <span>Confidential - Internal Use Only</span>
      </div>
    </div>
  );
}

function PrintSection({ title, children, fullWidth }) {
  return (
    <div className={cn(fullWidth ? "col-span-2" : "col-span-1")}>
      <h3 className="text-xs font-black text-indigo-900 border-b border-indigo-100 pb-2 mb-4 tracking-tighter uppercase">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function PrintField({ label, value }) {
  return (
    <div className="flex justify-between items-baseline border-b border-gray-50 pb-1">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{label}</span>
      <span className="text-[11px] font-bold text-gray-800">{value}</span>
    </div>
  );
}


function ToolbarButton({ icon, label, onClick, className, active }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 group",
        active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-95" : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600",
        className
      )}
    >
      <span className="transition-transform group-hover:scale-110">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ExportItem({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
    >
      {icon}
      {label}
    </button>
  );
}

function ScreenCard({ title, subtitle }) {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 group hover:border-indigo-200 transition-colors cursor-default">
       <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <FileText size={18} />
       </div>
       <div>
          <div className="text-xs font-black uppercase tracking-tight text-gray-800">{title}</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{subtitle}</div>
       </div>
    </div>
  );
}

function FormGroup({ label, children, dark }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
      <label className={cn(
        "text-[10px] font-black uppercase tracking-widest md:w-48 shrink-0",
        dark ? "text-slate-500" : "text-gray-400"
      )}>
        {label}
      </label>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
