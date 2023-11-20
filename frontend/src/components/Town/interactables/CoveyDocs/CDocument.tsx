import React, { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { ICDocDocument } from '../../../../types/CoveyTownSocket';
import CovDocsAreaController from '../../../../classes/interactable/CovDocsAreaController';
import { Button } from '@chakra-ui/react';
export default function CDocument({
  document,
  controller,
  handleBackToDirectory,
}: {
  document: ICDocDocument;
  controller: CovDocsAreaController;
  handleBackToDirectory: () => void;
}): JSX.Element {
  const editorRef = useRef<any>(null);

  if (editorRef.current) editorRef.current.setContent(document.content);

  useEffect(() => {
    const interval = setInterval(
      () =>
        editorRef.current && controller.writeToDoc(document.docID, editorRef.current.getContent()),
      5000,
    );
    return () => {
      clearInterval(interval);
    };
  }, [controller, document.docID]);

  return (
    <>
      <Editor
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue={document.content}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount',
          ],
          toolbar:
            'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        }}
      />
      <Button onClick={handleBackToDirectory}>Back</Button>
    </>
  );
}
