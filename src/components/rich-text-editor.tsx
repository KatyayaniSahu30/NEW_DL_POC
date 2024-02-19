import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
// import ReactQuill from 'react-quill';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [editorHtml, setEditorHtml] = useState(value);

  const handleChange = (html: string) => {
    setEditorHtml(html);
    onChange(html);
  };

  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
      ["link", "image", "video", "clean"], // All in the same line
    ],
    clipboard: {
      matchVisual: false,
    },
  }

  // Set heading 1 as the default header format
  // modules.toolbar[0][0]['header'] = 1;

  return (
    <ReactQuill
      theme="snow"
      value={editorHtml}
      onChange={handleChange}
      modules={modules}
      
    />
  );
};

export default RichTextEditor;
