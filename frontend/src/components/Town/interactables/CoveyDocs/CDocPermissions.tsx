 /* eslint-disable react-hooks/exhaustive-deps */
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Center,
  Divider,
  RadioGroup,
  MenuItem,
  MenuButton,
  MenuList,
  ChevronDownIcon,
  Stack,
  Radio,
  Heading,
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
  import TownController, { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
  import useTownController from '../../../../hooks/useTownController';
  import { CDocDocID, CDocUserID, InteractableID } from '../../../../types/CoveyTownSocket';
  import CovDocsAreaInteractable from '../CovDocsArea';
import Menu from '../../../VideoCall/VideoFrontend/components/MenuBar/Menu/Menu';
 
 
 /**
  * The Permissions component allows the user to edit the viewers, editors, and owner of a document. It is embedded within the document
  * component( the document component maintains its own tracking of its current screen, and when the share button is clicked it switches
  * to the permissions screen. The overall CDocArea UI does not deal directly with the Permissions UI.)
  */

 //permissionsWereChanged: ({owner: CDocUserID, editors: CDocUserID[], viewers: CDocUserID[]}) => void

export default function CDocPermissions(props: {owner: CDocUserID, editors: CDocUserID[], viewers: CDocUserID[], permissionsWereChanged: any}): JSX.Element {
const [viewers, setViewers] = useState<CDocUserID>(props.viewers);
const [newViewers, setNewViewers] = useState<CDocUserID>(viewers);

const [editors, setEditors] = useState<CDocUserID>(props.editors);
const [newEditors, setNewEditors] = useState<CDocUserID>(editors);

const [owner, setOwner] = useState<CDocUserID>(props.owner);
const [newOwner, setNewOwner] = useState(owner);


function DrawPermissionsTitle() {
  
  return (
    <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
      Edit the Permissions of this Document
    </GridItem>
  );
}


function DrawEditorsBox() {

  const UserRadioGroup = ({userID} : {userID : CDocUserID}) => {
    const [selectedOption, setSelectedOption] = useState('no selection');
    
    const isMakeViewerDisabled = (userID !== owner);
    const isRemoveAccessDisabled = (userID !== owner);

    const handleSelectChange = (value: string) => {
      setSelectedOption(value === selectedOption ? '' : value);

      if (selectedOption === 'viewer') {
        setNewViewers([...newViewers, userID]);
        setNewEditors(newEditors.filter((aUser: CDocUserID) => aUser !== userID));
      }else if (selectedOption === '') {
        setNewEditors([...new Set([...newEditors, userID])]);
        setNewViewers(newViewers.filter((aUser: CDocUserID) => aUser !== userID));
      }else if (selectedOption === 'remove') {
        setNewViewers(newViewers.filter((aUser: CDocUserID) => aUser !== userID));
        setNewEditors(newEditors.filter((aUser: CDocUserID) => aUser !== userID));
      }}
    
    return <RadioGroup onChange={handleSelectChange} value={selectedOption}>
                    <Stack direction='row'>
                      <Radio value='viewer' isDisabled={isMakeViewerDisabled}>Make viewer</Radio>
                      <Radio value='remove' isDisabled={isRemoveAccessDisabled}>Remove access</Radio>
                      </Stack>
                      </RadioGroup>
    }

    return (
      <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
        People who can edit:
        <List>
    {editors.map((user: CDocUserID) => {
                return <ListItem key={user}>
                  <Center height='50px'>
                    {user}
                    <Divider orientation='vertical' />
                    <UserRadioGroup userID={user}/>
                    </Center></ListItem>;
              })}
              </List>
      </GridItem>
    );
  }

  function DrawViewersBox() {

    const UserRadioGroup = ({userID} : {userID : CDocUserID}) => {

      const [selectedOption, setSelectedOption] = useState('no selection');

      const isMakeEditorDisabled = (viewers.find((user:CDocUserID) => user === userID) !== undefined);
      const isRemoveAccessDisabled = (userID !== owner);
  
      const handleSelectChange = (value: string) => {
        setSelectedOption(value === selectedOption ? '' : value);
        if (selectedOption === 'editor') {
          setNewEditors([...newEditors, userID]);
          setNewViewers(newViewers.filter((aUser: CDocUserID) => aUser !== userID))
        }
      }
      
      return <RadioGroup onChange={handleSelectChange} value={selectedOption}>
                      <Stack direction='row'>
                        <Radio value='editor' isDisabled={isMakeEditorDisabled}>Make editor</Radio>
                        <Radio value='remove' isDisabled={isRemoveAccessDisabled}>Remove access</Radio>
                        </Stack>
                        </RadioGroup>
      }

    return (
      <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
  People who can view:
  <List>
    {viewers.map((user: CDocUserID) => {
                return <ListItem key={user}>
                  <Center height='50px'>
                    {user}
                    <Divider orientation='vertical' />
                    <UserRadioGroup userID={user}/>
                    </Center></ListItem>;
              })}
              </List>
      </GridItem>
    );
  }

/**
 * Displays the id of the current owner of the document as well as an option to choose another user to transfer ownership to.
 * Clicking a user's id through the dropdown menu populates the 'transfer ownership to' field, and ownership is transferred after
 * clicking the save all changes button.
 */
  function DrawOwnershipBox() {

  function TransferOwnershipButton() {

    function handleClick(user: CDocUserID) {
      setNewOwner(user);
    }
      
      return <Menu>
  <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
    Transfer Ownership
    </MenuButton>
  <MenuList>
  {viewers.map((user: CDocUserID) => {
                return <MenuItem onClick={handleClick(user)} key={user}>
                  {user}
                </MenuItem>;
              })}
  </MenuList>
</Menu>
    }
  
  return (
      <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
        <Box>
          The Owner of this document is:
          </Box>
          <Box>
            {owner}
            </Box>
            <Box>
            </Box>
  
            <Box>
              <TransferOwnershipButton></TransferOwnershipButton>
              </Box>
    <Center height='50px'>
      Transferring ownership to:
    <Divider orientation='vertical' />
    {newOwner}
    </Center>
        </GridItem>
      );
  }

/**
 * Renders the save button, which saves all changes currently selected.
 * @returns 
 */
  function DrawSaveButton() {

    function handleSaveClick() {
      setOwner(newOwner);
      setEditors(newEditors);
      setViewers(newViewers);
     props.permissionsWereChanged({owner: owner, editors: editors, viewers: viewers})
    }

    return (
      <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
  <Button onClick={handleSaveClick()}>
    Save All Changes
  </Button>
      </GridItem>
    );
  }

  /**
   * Displays a button which allows the user to exit the Permissions UI and return to the document.
   * @returns 
   */
  function DrawExitButton() {
    //implement this the same way that permissionswerechanged was implemented? first see if that works
    function handleClick() {

}
    return (
      <GridItem rowSpan={1} colSpan={5} bg='yellow.200'>
        <Button onClick={handleClick()}>
          Exit
        </Button>
      </GridItem>
    );
  }

  return (
    //right now these are just the same dimensions as exist in the CDocArea file. Can change depending on what works/looks best along
    //with changing dimensions in CDocArea
    <Grid templateRows='repeat(7, 1fr)' templateColumns='repeat(6, 1fr)' width='500px' gap={4}>
      <GridItem rowSpan={4} colSpan={2} bg='green.200'>
        <DrawPermissionsTitle />
        <DrawEditorsBox/>
        <DrawViewersBox/>
        <DrawOwnershipBox/>
        <DrawSaveButton/>
        <DrawExitButton/>
    </GridItem>
  </Grid> 
  );
}
 
 

 // function DrawLeaderBoard(props: { hist: GameResult[] }) {
    //   const hist = props.hist;
  
    //   return (
    //     <GridItem rowSpan={4} colSpan={2} bg='green.200'>
    //       <Leaderboard results={hist} />
    //     </GridItem>
    //   );
    // }
  
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
