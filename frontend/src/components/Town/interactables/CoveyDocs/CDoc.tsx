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



export default function CDoc({ docID }: {docID: CDocDocID}): JSX.Element {
    return <Grid templateRows='repeat(7, 1fr)' templateColumns='repeat(6, 1fr)' width='500px' gap={4}>
    A Document
  </Grid>
}