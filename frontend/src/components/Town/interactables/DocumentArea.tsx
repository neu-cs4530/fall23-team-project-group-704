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

function DocumentArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  //implement a controller for the document area
  const [viewers, setViewers] = useState<String[]>(controller.viewers);
  const [editors, setEditors] = useState<GameResult[]>(controller.editors);
  const[currentDocument, setCurrentDocument] = useState<ICDocArea[]>(controller.currentDocument);
  useEffect(() => {
    const updateDoument = () => {
      setEditors(controller.viewers);
      setViewers(controller.editors);
    
    };
    controller.addListener('docUpdated', updateDocument);
    controller.addListener('docClosed', updateDocument);

    return () => {
      controller.removeListener('docUpdated', onGameEnd);
      controller.removeListener('docClosed', updateDocument);

    };
  }, [townController, gameAreaController, toast]);

  tinymce.init({
    selector: 'textarea#basic-example',
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
    'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
  });

  return (
    <Container>
    <Document documents={currentDocument} />
    </Container>
  );
}





