import React, { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { ICDocDocument, ICDocUserDataMap } from '../../../../types/CoveyTownSocket';
import CDocsAreaController from '../../../../classes/interactable/CDocsAreaController';
import { Button, ListItem, UnorderedList } from '@chakra-ui/react';
export default function CDocument({
  document,
  controller,
  handleBackToDirectory,
  canView,
}: {
  document: ICDocDocument;
  controller: CDocsAreaController;
  handleBackToDirectory: () => void;
  handlePermissions: () => void;
  canView: boolean;
}): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  if (editorRef.current) editorRef.current.setContent(document.content);

  useEffect(() => {
    const interval = setInterval(
      () =>
        editorRef.current &&
        !canView &&
        controller.writeToDoc(document.docID, editorRef.current.getContent()),
      5000,
    );
    return () => {
      clearInterval(interval);
    };
  }, [controller, document.docID]);

  return (
    <>
      <Editor
        disabled={canView}
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
