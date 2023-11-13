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
  import { InteractableID } from '../../../../types/CoveyTownSocket';
  
  /**
   * The CDocSharing component renders the sharing/permissions editing interface for covey boards.
   *
   * It uses Chakra-UI components
   *
   *
   */
  function CDocSharing({ interactableID }: { interactableID: InteractableID }): JSX.Element {
    const areaController = useInteractableAreaController<CovDocsAreaController>(interactableID);
  
    const town = useTownController();
    const initialOurPlayer = town.ourPlayer;
    //const initialOtherPlayer = areaController.players.find(p => p !== initialOurPlayer); //are there other players?
  
    //initiating necessary fields from areacontroller
    const [fields, setFields] = useState({
    //   hist: areaController.history,
    //   xPlayer: areaController.x ? areaController.x.userName : '(No player yet!)',
    //   oPlayer: areaController.o ? areaController.o.userName : '(No player yet!)',
    //   observers: areaController.observers.map(user => user.userName),
    //   status: areaController.status,
    //   ourturn: areaController.isOurTurn,
    //   moveCount: areaController.moveCount,
    //   whoseTurn: areaController.whoseTurn,
       ourPlayer: initialOurPlayer,
    //   otherPlayer: initialOtherPlayer,
    });
  
    const updateFields = () => {
      console.log(areaController.x?.userName);
      setFields({
        // hist: areaController.history,
        // xPlayer: areaController.x ? areaController.x.userName : '(No player yet!)',
        // oPlayer: areaController.o ? areaController.o.userName : '(No player yet!)',
        // observers: areaController.observers.map(user => user.userName),
        // status: areaController.status,
        // ourturn: areaController.isOurTurn,
        // moveCount: areaController.moveCount,
        // whoseTurn: areaController.whoseTurn,
         ourPlayer: town.ourPlayer,
        // otherPlayer: areaController.players.find(p => p !== town.ourPlayer),
      });
    };
  
    function GameEnded() {
      let message;
  
      const atoast = useToast();
  
      if (areaController.winner === undefined) {
        message = 'Game ended in a tie';
      } else if (areaController.winner === fields.ourPlayer) {
        message = 'You won!';
      } else {
        message = 'You lost :(';
      }
  
      atoast({
        title: 'Game Over',
        description: message,
        status: 'info',
        duration: 9000,
        isClosable: true,
      });
    }
  
    useEffect(() => {
      // Subscribe to events when the component mounts
      areaController.addListener('gameUpdated', updateFields);
      areaController.addListener('gameEnd', GameEnded);
      // Unsubscribe from events when the component unmounts
      return () => {
        areaController.removeListener('gameUpdated', updateFields);
        areaController.removeListener('gameEnd', GameEnded);
      };
    }, [areaController]);
  
    function DrawLeaderBoard(props: { hist: GameResult[] }) {
      const hist = props.hist;
  
      return (
        <GridItem rowSpan={4} colSpan={2} bg='green.200'>
          <Leaderboard results={hist} />
        </GridItem>
      );
    }
  
    // function DrawPlayerList(props: { xUser: string; oUser: string }) {
    //   // const controller = props.controller;
  
    //   // const players = props.players;
    //   // let xUser = props.xplayer ? props.xplayer.userName : '(No player yet!)';
    //   // let oUser = props.oplayer ? props.oplayer.userName : '(No player yet!)';
  
    //   const [x, setX] = useState(props.xUser);
    //   const [o, setO] = useState(props.oUser);
    //   useEffect(() => {
    //     setX(props.xUser);
    //     setO(props.oUser);
    //     console.log('updated');
    //     // const setX = controller.x ? controller.x.userName : '(No player yet!)';
    //     // const setO = controller.o ? controller.o.userName : '(No player yet!)';
    //     // setXUser(setX);
    //     // console.log(setX);
    //     // setOUser(setO);
    //     // console.log(setO);
    //   }, [props.xUser, props.oUser]);
  
    //   // const xUser = players[0] ? players[0].userName : '(No player yet!)';
    //   // const oUser = players[1] ? players[1].userName : '(No player yet!)';
    //   console.log(
    //     `gamecontrollerhas x: ${gameAreaController.x?.userName}, x user: ${props.xUser}, gamecontrollerhas o: ${gameAreaController.o?.userName}, o user: ${props.oUser}`,
    //   );
  
    //   return (
    //     <GridItem rowSpan={1} colSpan={5} bg='purple.200'>
    //       <Box bg='purple.400' color='white'>
    //         list of players in the game
    //       </Box>
    //       <List
    //         aria-label='list of players in the game'
    //         style={{ display: 'flex', flexDirection: 'row' }}>
    //         <ListItem style={{ flex: '0 0 auto' }} mr={2}>
    //           X: {x}
    //         </ListItem>
    //         <ListItem style={{ flex: '0 0 auto' }}>O: {o}</ListItem>
    //       </List>
    //     </GridItem>
    //   );
    // }
  
    function DrawPermissionsLabel(props: { }) {
  
      return (
        <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
    
        </GridItem>
      );
    }
  
    function DrawEditorsBox(props: { }) {
  
        return (
          <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
      
          </GridItem>
        );
      }
  
      function DrawViewersBox(props: { }) {
  
        return (
          <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
      
          </GridItem>
        );
      }

      function DrawOwnershipBox(props: { }) {
  
        return (
          <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
      
          </GridItem>
        );
      }

      function DrawSaveButton(props: { }) {
  
        return (
          <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
      
          </GridItem>
        );
      }

    // function DrawJoinButton(props: { controller: TicTacToeAreaController }) {
    //   const atoast = useToast();
    //   // eslint-disable-next-line react/prop-types
    //   const controller = props.controller;
    //   const [isLoading, setIsLoading] = useState(false);
    //   const toggleButtonOn = () => {
    //     setIsLoading(false);
    //   };
    //   const toggleButtonOff = () => {
    //     setIsLoading(true);
    //   };
    //   const [buttonText, setButtonText] = useState('Join New Game');
  
    //   const updateButtonText = () => {
    //     if (isLoading) {
    //       setButtonText('Loading...');
    //     } else {
    //       setButtonText('Join New Game');
    //     }
    //   };
  
    //   async function handleJoinClick() {
    //     toggleButtonOff();
    //     updateButtonText();
    //     try {
    //       // eslint-disable-next-line react/prop-types
    //       await controller.joinGame();
    //     } catch (err) {
    //       console.error('Error joining the game:', err);
    //       atoast({
    //         title: 'Error',
    //         description: (err as Error).toString(),
    //         status: 'error',
    //         duration: 9000,
    //         isClosable: true,
    //       });
    //     } finally {
    //       toggleButtonOn();
    //       updateButtonText();
    //     }
    //   }
  
    //   const getJoinButtonContent = () => {
    //     if (areaController.status === 'WAITING_TO_START') {
    //       if (areaController.isPlayer) {
    //         return (
    //           <GridItem rowSpan={1} colSpan={2} bg='yellow.200'>
    //             You have joined the game!
    //           </GridItem>
    //         );
    //       } else {
    //         return (
    //           <GridItem
    //             rowSpan={1}
    //             colSpan={2}
    //             bg='yellow.200'
    //             display='flex'
    //             justifyContent='center'
    //             alignItems='center'>
    //             <Button
    //               bg='red.400'
    //               fontSize='sm'
    //               type='submit'
    //               onClick={handleJoinClick}
    //               width={120}
    //               isLoading={isLoading}
    //               disabled={isLoading}>
    //               {buttonText}
    //             </Button>
    //           </GridItem>
    //         );
    //       }
    //     } else if (areaController.status === 'IN_PROGRESS') {
    //       return (
    //         <GridItem rowSpan={1} colSpan={2} bg='yellow.200'>
    //           Game is in progress
    //         </GridItem>
    //       );
    //     } else {
    //       //the game is over, so the button should reappear
    //       return (
    //         <GridItem
    //           rowSpan={1}
    //           colSpan={2}
    //           bg='yellow.200'
    //           display='flex'
    //           justifyContent='center'
    //           alignItems='center'>
    //           <Button
    //             bg='red.400'
    //             fontSize='sm'
    //             type='submit'
    //             onClick={handleJoinClick}
    //             width={120}
    //             isLoading={isLoading}
    //             disabled={isLoading}>
    //             {buttonText}
    //           </Button>
    //         </GridItem>
    //       );
    //     }
    //   };
  
    //   return getJoinButtonContent();
    // }
  
  
    return (
      <>
        {
          <Grid templateRows='repeat(7, 1fr)' templateColumns='repeat(6, 1fr)' width='500px' gap={4}>
            <DrawPermissionsLabel />
            <DrawEditorsBox />
            <DrawViewersBox />
            <DrawOwnershipBox />
            <DrawSaveButton />
          </Grid>
        }
      </>
    );
  }
  
  // Do not edit below this line
  /**
   * A wrapper component for the TicTacToeArea component.
   * Determines if the player is currently in a tic tac toe area on the map, and if so,
   * renders the TicTacToeArea component in a modal.
   *
   */

//how to edit this for boardarea?
//change this to render the file with all of the ui components combined
  export default function TicTacToeAreaWrapper(): JSX.Element {
    const cDocArea = useInteractable<CDocAreaInteractable>('cDocArea');
    const townController = useTownController();
    const closeModal = useCallback(() => {
      if (cDocArea) {
        townController.interactEnd(cDocArea);
        const controller = townController.getGameAreaController(cDocArea);
        controller.leaveGame();
      }
    }, [townController, gameArea]);
  
    if (gameArea && gameArea.getData('type') === 'TicTacToe') {
      return (
        <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{gameArea.name}</ModalHeader>
            <ModalCloseButton />
            <CDocSharing interactableID={gameArea.name} />
          </ModalContent>
        </Modal>
      );
    }
    return <></>;
  }
  