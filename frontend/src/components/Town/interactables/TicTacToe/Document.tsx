// DocumentViewer.tsx
import React, { useEffect } from 'react';
import TinyMCE from 'tinymce';
import 'tinymce/themes/silver';
import DocumentArea from './DocumentArea';
import { ICDocDocument } from '../../../../types/CoveyTownSocket';
interface DocumentViewerProps {
  documentContent: string;
}

const Document: React.FC<ICDocDocument> = ({ currentDocument }) => {
  useEffect(() => {
    // Initialize TinyMCE with the provided document content
    TinyMCE.init({
      selector: '#documentEditor',
      height: 500,
      menubar: false,
      plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table paste code help wordcount'
      ],
      toolbar: 'undo redo | formatselect | ' +
               'bold italic backcolor | alignleft aligncenter ' +
               'alignright alignjustify | bullist numlist outdent indent | ' +
               'removeformat | help'
    });

    // Set the document content in the TinyMCE editor
    TinyMCE.activeEditor.setContent(currentDocument.content);

    // Clean up TinyMCE when the component unmounts
    return () => {
      TinyMCE.activeEditor.destroy();
    };
  }, [currentDocument.content]);

  return <div id="documentEditor"></div>;
};

export default Document;
