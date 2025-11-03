import { Dose, ESTRADIOL_ESTERS } from '../data/estradiolEsters';
import { formatNumber } from '../utils/formatters';

interface DoseEditorProps {
  selectedDoseData: Dose | null;
  onUpdateDoseEster: (day: number, esterName: string) => void;
  onUpdateDoseAmount: (day: number, newDose: number) => void;
  onRemoveDose: (day: number) => void;
  onClose: () => void;
}

const DoseEditor: React.FC<DoseEditorProps> = ({
  selectedDoseData,
  onUpdateDoseEster,
  onUpdateDoseAmount,
  onRemoveDose,
  onClose
}) => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: selectedDoseData ? '#f3eeff' : '#ffffff',
      border: `1px solid ${selectedDoseData ? '#d8c7f0' : '#dee2e6'}`,
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      height: '454px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {selectedDoseData ? (
        <>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Edit Injection - Day {selectedDoseData.day}</h4>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Estradiol Ester:</label>
            <select
              value={selectedDoseData.ester.name}
              onChange={(e) => onUpdateDoseEster(selectedDoseData.day, e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              {ESTRADIOL_ESTERS.map((ester) => (
                <option key={ester.name} value={ester.name}>
                  {ester.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Dose (mg):</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                value={formatNumber(selectedDoseData.dose)}
                onChange={(e) => onUpdateDoseAmount(selectedDoseData.day, parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                max="20"
                style={{
                  width: '80px',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: '#666', fontSize: '14px' }}>mg</span>
            </div>
          </div>

          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e8dff5', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#5a3d7a' }}>Pharmacokinetic Parameters:</div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>D:</span>
                <span style={{ fontFamily: 'monospace' }}>{selectedDoseData.ester.D.toExponential(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>k1:</span>
                <span style={{ fontFamily: 'monospace' }}>{selectedDoseData.ester.k1.toFixed(4)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>k2:</span>
                <span style={{ fontFamily: 'monospace' }}>{selectedDoseData.ester.k2.toFixed(4)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>k3:</span>
                <span style={{ fontFamily: 'monospace' }}>{selectedDoseData.ester.k3.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 16px',
                backgroundColor: '#8b72b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Done
            </button>
            <button
              onClick={() => onRemoveDose(selectedDoseData.day)}
              style={{
                padding: '10px 16px',
                backgroundColor: '#c77a9b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Instructions</h4>
          <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6' }}>
            Click on any day in the calendar to add an injection. Click on an existing injection to edit its dose and ester type.
          </p>
          <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6', marginTop: '12px' }}>
            Each injection can use a different estradiol ester with unique pharmacokinetic properties.
          </p>
        </>
      )}
    </div>
  );
};

export default DoseEditor;
