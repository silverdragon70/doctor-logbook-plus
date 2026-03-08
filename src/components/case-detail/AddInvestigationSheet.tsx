import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  background: '#F8FAFC', border: '1.5px solid #DDE3EA', borderRadius: '12px',
  padding: '12px 16px', color: '#1A2332', fontSize: '15px', width: '100%',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: { name?: string; type?: string; date?: string; result?: string } | null;
}

const AddInvestigationSheet = ({ open, onClose, onSave, initialData }: Props) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Lab Result');
  const [date, setDate] = useState('');
  const [result, setResult] = useState('');
  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setType(initialData.type || 'Lab Result');
      setDate(initialData.date || '');
      setResult(initialData.result || '');
    } else {
      setName(''); setType('Lab Result'); setDate(''); setResult('');
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSave = () => {
    onSave({ name, type, date, result });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white animate-in slide-in-from-bottom duration-300"
        style={{ borderRadius: '24px 24px 0 0', maxHeight: '85vh', overflow: 'auto' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#D1D5DB' }} />
        </div>
        <div className="flex items-center justify-between px-5 pb-3">
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A2332' }}>
            {isEdit ? 'Edit Investigation' : 'Add Investigation'}
          </span>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/50">
            <X size={20} style={{ color: '#6B7C93' }} />
          </button>
        </div>
        <div style={{ borderTop: '1px solid #DDE3EA' }} />
        <div className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <span style={labelStyle}>Investigation Name</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CBC, Chest X-Ray..."
              style={inputStyle} className="focus:!border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span style={labelStyle}>Type</span>
              <select value={type} onChange={e => setType(e.target.value)}
                style={{ ...inputStyle, appearance: 'auto' }}>
                <option>Lab Result</option>
                <option>Imaging</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <span style={labelStyle}>Date</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={inputStyle} className="focus:!border-[#2563EB]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <span style={labelStyle}>Result (Text)</span>
            <textarea value={result} onChange={e => setResult(e.target.value)} placeholder="Enter findings..."
              rows={3} style={{ ...inputStyle, resize: 'none' }} className="focus:!border-[#2563EB]" />
          </div>
          <button className="w-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ ...inputStyle, border: '1.5px dashed #DDE3EA', color: '#6B7C93', fontWeight: 600 }}>
            <Upload size={16} /> {isEdit ? 'Attached image' : 'Attach image (optional)'}
          </button>
          <button onClick={handleSave}
            style={{ width: '100%', height: '52px', borderRadius: '12px', background: '#2563EB', color: '#FFFFFF', fontSize: '16px', fontWeight: 700, border: 'none' }}>
            {isEdit ? 'Save Changes' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInvestigationSheet;
