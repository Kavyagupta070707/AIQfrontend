import { QRCodeCanvas } from "qrcode.react";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator = ({ value, size = 200, className = "" }: QRCodeGeneratorProps) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="p-4 bg-white rounded-lg shadow-lg">
        <QRCodeCanvas
          value={value}
          size={size}
          level="H" // High error correction
          includeMargin={true}
        />
      </div>
    </div>
  );
};

export default QRCodeGenerator;