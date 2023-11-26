import { ICDocDocument } from '../../../../types/CoveyTownSocket';
import React from 'react';
import styled from 'styled-components';
import { TableContainer, Text, Thead, Tbody, Tr, Td, Th, Table, Button } from '@chakra-ui/react';

const StyledDocument = styled(Tr)`
  &:hover {
    box-shadow: 10px 5px 5px gray;
  }

  :hover {
    background-color: yellow;
  }
`;

const StyledDirectory = styled(TableContainer)`
  display: flex;
  flex-direction: column;
  padding: 20px;
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

export default function CDocDirectory({
  documents,
  handleClick,
  handleClickPermissions,
  handleNewDoc,
}: {
  documents: ICDocDocument[];
  handleClick: (docId: string) => void;
  handleClickPermissions: () => void;
  handleNewDoc: () => void;
}): JSX.Element {
  const cdocs = documents.map((d, index) => {
    return (
      <StyledDocument key={index}>
        <Td onClick={() => handleClick(d.docID)}>{d.docName}</Td>
        <Td>{d.owner}</Td>
        <Td>{d.createdAt}</Td>
        <Td>
          <Button onClick={handleClickPermissions}>Edit Permissions</Button>
        </Td>
      </StyledDocument>
    );
  });

  return (
    <StyledDirectory>
      <Text fontSize='3xl'>Document Directory</Text>

      <Table size='sm'>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Owner</Th>
            <Th isNumeric>Created At</Th>
            <Th>Permissions</Th>
          </Tr>
        </Thead>
        <Tbody>{cdocs}</Tbody>
      </Table>
      <Button onClick={handleNewDoc}>New Doc</Button>
    </StyledDirectory>
  );
}
