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
  
  /**
   * The CDocArea component renders the UI of the overall Covey Docs Area, keeping track of the current screen shown to the user
   * as a state parameter and allowing switching between different screens depending on what buttons the user clicks.
   *
   * It uses Chakra-UI components
   *
   */
  function CDocArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
    const areaController = useInteractableAreaController<CovDocsAreaController>(interactableID);
  
    const town = useTownController();
    //const initialOurPlayer = town.ourPlayer;
    //const initialOtherPlayer = areaController.players.find(p => p !== initialOurPlayer); //are there other players?
  

    //renders the initial, login screen
    function DrawLoginScreen() { 
      return (
        <Grid templateRows='repeat(7, 1fr)' templateColumns='repeat(6, 1fr)' width='500px' gap={4}>
            Hello, welcome to CoveyBoards
            {<DrawLoginLabel/>}
          </Grid>         
        );}

    //Renders 'Login' label for login screen: subcomponent of initialScreen
        function DrawLoginLabel(props: { }) {
          return (
            <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
            </GridItem>
          );
        }

  //sets the current screen to start out as the login screen
    const [currentScreen, setCurrentScreen] = useState(DrawLoginScreen());
  
//draws a document
 function DrawDocumentScreen(props: { doc_id: CDocDocID, user_id: CDocUserID, newDoc: boolean }): JSX.Element {
      const docID = props.doc_id;
      const userID = props.user_id;
      const newDoc = props.newDoc;
  
      return (
        <Grid templateRows='repeat(7, 1fr)' templateColumns='repeat(6, 1fr)' width='500px' gap={4}>
          <GridItem rowSpan={4} colSpan={2} bg='green.200'>
            <CDoc docID={docID} userID = {userID} newDoc = {newDoc} />
        </GridItem>
      </Grid> 
      );
    }


  //subscribes listeners to the different events that can be emitted by the controller in order to know when to re-render
    useEffect(() => {
      // Subscribe to events when the component mounts
      //input document area here directly?
      areaController.addListener('docOpened', setCurrentScreen(DrawDocumentScreen({doc_id: '011', user_id: 'name', newDoc: false})));
      areaController.addListener('docClosed', setCurrentScreen(DrawDirectoryScreen()));
      areaController.addListener('docUpdated', setCurrentScreen(DrawDocumentScreen({doc_id: '011', user_id: 'name', newDoc: false})));
      areaController.addListener('newUserRegistered', setCurrentScreen(DrawDirectoryScreen()));
      areaController.addListener('userLoggedIn', setCurrentScreen(DrawDirectoryScreen()));
      areaController.addListener('newDocumentCreated', setCurrentScreen(DrawDocumentScreen({doc_id: '011', user_id: 'name', newDoc: true})));
      areaController.addListener('userLoggedOut', setCurrentScreen(DrawLoginScreen()));
      return () => {
        // Unsubscribe from events when the component unmounts
      };
    }, [areaController]);


  
   //main return statment that renders whatever the current screen is
    return (
    {currentScreen}
    );
  }
  

  /**
   * A wrapper component for the CovDocsArea component.
   * Determines if the player is currently in a covDocs area on the map, and if so,
   * renders the CovDocsArea component in a modal.
   *
   */

//any additional edits needed to suit this to covDocsarea?
  export default function CovDocsAreaWrapper(): JSX.Element {
    const covDocsArea = useInteractable<CovDocsAreaInteractable>('covDocsArea');
    const townController = useTownController();
    const closeModal = useCallback(() => {
      if (covDocsArea) {
        townController.interactEnd(covDocsArea);
        const controller = townController.getCovDocsAreaController(covDocsArea);
        //controller.leaveGame(); what to put here?
      }
    }, [townController, covDocsArea]);
  
    if (covDocsArea && covDocsArea.getData('type') === 'covDocs') {//?
      return (
        <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{covDocsArea.name}</ModalHeader>
            <ModalCloseButton />
            <CDocArea interactableID={covDocsArea.name} />
          </ModalContent>
        </Modal>
      );
    }
    return <></>;
  }
  