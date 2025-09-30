import React, { useRef } from 'react';
import { Upload } from 'react-feather';
import { Button } from './button/Button';
import './FileUpload.scss';

interface FileUploadProps {
  onFileLoad: (data: any) => void;
  acceptedTypes?: string;
}

export function FileUpload({ onFileLoad, acceptedTypes = '.xlsx,.xls,.csv' }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          onFileLoad({ file, data });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Button
        label="スプレッドシートを読み込み"
        icon={Upload}
        iconPosition="start"
        buttonStyle="action"
        onClick={handleButtonClick}
      />
    </div>
  );
}
