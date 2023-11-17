import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  Heading,
  List,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import TicTacToeAreaController from '../../../../classes/interactable/TicTacToeAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { GameResult, GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import ICDocDocument from './ICDocDocument';
import { ICDocArea } from '../../../../types/CoveyTownSocket';
import CovDocsAreaController from '../../../../classes/interactable/CovDocsAreaController';

function DocumentArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  let controller = CovDocsAreaController.getInstance(interactableID);
  //implement a controller for the document area
  const [viewers, setViewers] = useState<String[]>(controller.viewers);
  const [editors, setEditors] = useState<GameResult[]>(controller.editors);
  const [content, setContent] = useState<String>(controller.content);
  const [currentDoc, setCurrentDoc] = useState<String>("");

  const[currentDocument, setCurrentDocument] = useState<ICDocArea[]>(controller.currentDocument);
  useEffect(() => {
    const updateDoument = () => {
      setEditors(controller.viewers);
      setViewers(controller.editors);
       
    };
    const closeDoument = () => {
     setCurrentDoc("");
    };
    const openDoument = () => {
      setCurrentDoc(controller.currentDocument);
     };
    controller.addListener('docUpdated', updateDocument);
    controller.addListener('docClosed', closeDoument);
    controller.addListener('docOpened', openDoument);

    return () => {
      controller.removeListener('docUpdated', updateDocument);
      controller.removeListener('docClosed', closeDoument);
      controller.removeListener('docOpened', openDoument);

    };
  }, [townController,controller]);


  return (
    <Container>
    <Document documents={currentDocument} />
    </Container>
  );
}

export default DocumentArea;





