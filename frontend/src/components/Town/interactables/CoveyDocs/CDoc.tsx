/* eslint-disable react-hooks/exhaustive-deps */
import {
    Box,
    Button,
    Grid,
    GridItem,
    List,
    ListItem,
    Modal,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    useToast,
  } from '@chakra-ui/react';
  //import EventEmitter from 'events';
  import React, { useCallback, useEffect, useState } from 'react';
  import CovDocsAreaController from '../../../../classes/interactable/CovDocsAreaController';
  import PlayerController from '../../../../classes/PlayerController';
  import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
  import useTownController from '../../../../hooks/useTownController';
  import { CDocDocID, CDocUserID, InteractableID } from '../../../../types/CoveyTownSocket';
  import CovDocsAreaInteractable from '../CovDocsArea';
import CDocDirectory from './CDocDirectory';
  import CDocPermissions from './CDocPermissions';


export default function CDoc({ docID, areaController }: {docID: CDocDocID, areaController: CovDocsAreaController}): JSX.Element {

if (areaController.activeDocID === undefined || areaController.activeDocID !== docID) {
  throw new Error('this document is not the currently active document.');
}

const document = areaController.activeDocContent;

const [owner, setOwner] = useState<CDocUserID>(document?.owner);
const [editors, setEditors] = useState<CDocUserID>();
const [viewers, setViewers] = useState<CDocUserID>();



 const handlePermissionsChange = ({owner, editors, viewers}: {owner: CDocUserID, editors: CDocUserID[], viewers: CDocUserID[]}) => {
  setOwner(owner);
  setEditors(editors);
  setViewers(viewers);
}


    return <Grid templateRows='repeat(7, 1fr)' templateColumns='repeat(6, 1fr)' width='500px' gap={4}>
    A Document
    <GridItem rowSpan={4} colSpan={2} bg='green.200'>
  <CDocPermissions owner={''} editors={[]} viewers={[]} permissionsWereChanged={handlePermissionsChange}>  </CDocPermissions>
        </GridItem>
  </Grid>

}