import { CDocument } from '../../../../types/CoveyTownSocket';
import React from 'react';
import styled from "styled-components";


const StyledDocument = styled.div`
  background-color: white;
`;

const StyledDirectory = styled.div`
  display: flex;
  flex-direction: row;
`;
/**
 * A component that renders a list of documents that they own and/or can view
 * - Name: the name of the document
 * - Owner: the name of the owner of the document
 * - EditPermissions: if they can edit this document or not
 * - Last Saved: the time of the last saving of the document
 * - Last User: the last user on the document
 *
 * @returns
 */

export default function CDocDirectory({ documents }: { documents: CDocument[] }): JSX.Element {
  documents.map(d => {
    return (
      <StyledDocument>
    <h2>{d.name}</h2>
        <h4>{d.ownerID}</h4>
        {/*<h4>View: {d.permissions.view}</h4>*/}
        <h4>Edit: {d.permissions.edit}</h4>
        <h4>Last saved: {d.last_saved}</h4>
        <h4>Last opened by: {d.last_user}</h4>
        <hr/>
        </StyledDocument>
    )
  })
  return (
    <StyledDirectory>
    {documents}
    </StyledDirectory>
  );
}
