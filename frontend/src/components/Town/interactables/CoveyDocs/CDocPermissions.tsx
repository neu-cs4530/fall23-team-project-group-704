/* eslint-disable react-hooks/exhaustive-deps */
import {
  Center,
  Divider,
  RadioGroup,
  Stack,
  Radio,
  Flex,
  Text,
  Heading,
  Box,
  Button,
  Grid,
  ChakraProvider,
  FormControl,
  FormLabel,
  // GridItem,
  List,
  ListItem,
  Input,
} from '@chakra-ui/react';
// import { ChevronDownIcon } from '@chakra-ui/icons';
//import EventEmitter from 'events';
import React, { useState } from 'react';
import {
  CDocUserID,
  ExtendedPermissionType,
  PermissionType,
} from '../../../../../../shared/types/CoveyTownSocket';

/**
 * The Permissions component allows the user to edit the viewers, editors, and owner of a document. It is embedded within the document
 * component( the document component maintains its own tracking of its current screen, and when the share button is clicked it switches
 * to the permissions screen. The overall CDocArea UI does not deal directly with the Permissions UI.)
 */

//permissionsWereChanged: ({theOwner: CDocUserID, theEditors: CDocUserID[], theViewers: CDocUserID[]}) => void

export default function CDocPermissions(props: {
  owner: CDocUserID;
  editors: CDocUserID[];
  viewers: CDocUserID[];
  permissionsWereChanged: (permissions: {
    theOwner: CDocUserID;
    theEditors: CDocUserID[];
    theViewers: CDocUserID[];
  }) => void;
  handleExit: () => void;
}): JSX.Element {
  function DrawEditorsBox(cfg: { permissionType: PermissionType }) {
    const UserRadioGroup = ({ userID }: { userID: CDocUserID }) => {
      const [selectedOption, setSelectedOption] = useState('no selection');

      const isMakeViewerDisabled = userID !== props.owner;
      const isRemoveAccessDisabled = userID !== props.owner;

      const handleSelectChange = (value: string) => {
        setSelectedOption(value === selectedOption ? '' : value);
      };

      return (
        <RadioGroup onChange={handleSelectChange} value={selectedOption}>
          <Stack direction='row'>
            <Radio
              value={cfg.permissionType === 'EDIT' ? 'editor' : 'viewer'}
              isDisabled={isMakeViewerDisabled}>
              Make {cfg.permissionType === 'EDIT' ? 'editor' : 'viewer'}
            </Radio>
            <Radio value='remove' isDisabled={isRemoveAccessDisabled}>
              Remove access
            </Radio>
          </Stack>
        </RadioGroup>
      );
    };
    // const fakeEditors = ['ingi59d', 't', 'p'];

    return (
      <Box>
        <Text fontSize='16px' fontWeight={'semibold'} bg='blue.100'>
          People who can {cfg.permissionType === 'VIEW' ? 'view' : 'edit'}:
        </Text>
        <Box maxH='100px' overflowY='auto' maxW='250px' overflowX='auto'>
          <List>
            {(cfg.permissionType === 'VIEW' ? props.viewers : props.editors).map(
              (user: CDocUserID) => {
                return (
                  <ListItem key={user}>
                    <Center height='50px'>
                      {user}
                      <Divider orientation='vertical' />
                      <UserRadioGroup userID={user} />
                    </Center>
                  </ListItem>
                );
              },
            )}
          </List>
        </Box>
      </Box>
    );
  }
  /**
   * Displays the id of the current owner of the document as well as an option to choose another user to transfer ownership to.
   * Clicking a user's id through the dropdown menu populates the 'transfer ownership to' field, and ownership is transferred after
   * clicking the save all changes button.
   */

  /**   function TransferOwnershipButton() {
    function handleClick(user: CDocUserID) {
      setNewOwner(user);
    }
    //rightIcon={<ChevronDownIcon />}
    const fakeViewers = ['i', 't', 'p'];
    return (
      <Menu>
        <MenuButton as={Button}>Transfer Ownership</MenuButton>
        <MenuList>
          {fakeViewers.map((user: CDocUserID) => {
            return (
              <MenuItem onClick={() => handleClick(user)} key={user}>
                {user}
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>
    );
  }*/
  /**function DrawOwnershipBox() {
    return (
      <Box>
        <Heading size='md' m='2'>
          The Owner of this document is:
        </Heading>
        <Text bg='purple.100' border={'1px'} textAlign='center'>
          {props.owner}
        </Text>
        <Box></Box>

        <Box m='2'>
          <TransferOwnershipButton></TransferOwnershipButton>
        </Box>
        <Center height='50px'>
          <Text fontSize='13px' m='1'>
            Transferring ownership to:
          </Text>
          <Divider orientation='vertical' />
          <Text fontSize={'13px'} m='1'>
            {' '}
            {newOwner}
          </Text>
        </Center>
      </Box>
    );
  }
**/
  const [selectedOption, setSelectedOption] = useState<ExtendedPermissionType>('VIEW');

  //to add: when clicking submit button, validate that the input user id is a real user
  //disable the buttons if the form is empty
  //allow the buttons to be unclicked
  //make it so that clicking the other button doesnt clear the form
  function AddUserField() {
    const AddUserRadioGroup = () => {
      const isMakeEditorDisabled = false;
      // how to check if this user is an editor?

      const handleSelectChange = (value: string) => {
        if (value === 'EDIT') {
          setSelectedOption('EDIT');
        } else if (value === 'VIEW') {
          setSelectedOption('VIEW');
        } else if (value === '') {
          setSelectedOption('REMOVE');
        }
      };

      return (
        <RadioGroup onChange={handleSelectChange} value={selectedOption}>
          <Stack direction='row'>
            <Radio value='EDIT' isDisabled={isMakeEditorDisabled}>
              Add as Editor
            </Radio>
            <Radio value='VIEW'>Add as Viewer</Radio>
          </Stack>
        </RadioGroup>
      );
    };

    const [formData, setFormData] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFormDataChange = (e: any) => {
      const value = e.target.value;
      setFormData(value);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = (e: any) => {
      let newEditors: CDocUserID[] = [];
      let newViewers: CDocUserID[] = [];
      newEditors = props.editors.filter((aUser: CDocUserID) => aUser !== formData);
      newViewers = props.viewers.filter((aUser: CDocUserID) => aUser !== formData);
      if (selectedOption === 'EDIT') {
        newEditors = [...newEditors, formData];
      } else if (selectedOption === 'VIEW') newViewers = [...newViewers, formData];

      e.preventDefault();
      props.permissionsWereChanged({
        theOwner: props.owner,
        theEditors: newEditors,
        theViewers: newViewers,
      });
      console.log(formData);
    };

    return (
      <Box m='2'>
        <Text>Add a New User</Text>
        <ChakraProvider>
          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>User ID:</FormLabel>
              <Input type='text' name='username' value={formData} onChange={handleFormDataChange} />
            </FormControl>
            <AddUserRadioGroup />
            <Button type='submit'>Submit</Button>
          </form>
        </ChakraProvider>
      </Box>
    );
  }
  /** 
  /**
   * Renders the save button, which saves all changes currently selected.
   * @returns
   
  function DrawSaveButton() {
    function handleSaveClick() {
      let newEditors: CDocUserID[] = [];
      let newViewers: CDocUserID[] = [];
      if (selectedOption === 'EDIT') {
        newEditors = [...newEditors, formData.username];
        newViewers = newViewers.filter((aUser: CDocUserID) => aUser !== formData.username);
      } else if (selectedOption === 'VIEW') {
        newViewers = [...newViewers, formData.username];
        newEditors = newEditors.filter((aUser: CDocUserID) => aUser !== formData.username);
      } else if (selectedOption === 'REMOVE') {
        newEditors = newEditors.filter((aUser: CDocUserID) => aUser !== formData.username);
        newViewers = newViewers.filter((aUser: CDocUserID) => aUser !== formData.username);
      }

      //  e.preventDefault();
      props.permissionsWereChanged({
        theOwner: props.owner,
        theEditors: newEditors,
        theViewers: newViewers,
      });
      console.log(formData);
    }

    return (
      <Button m={'2'} onClick={() => handleSaveClick()}>
        Save Changes
      </Button>
    );
  }*/

  /**
   * Displays a button which allows the user to exit the Permissions UI and return to the document.
   * @returns
   * */
  function DrawExitButton() {
    //implement this the same way that permissionswerechanged was implemented? first see if that works
    function handleClick() {
      props.handleExit();
    }

    return (
      <Button m={'2'} onClick={() => handleClick()}>
        Exit
      </Button>
    );
  }

  return (
    <Flex direction='column' justify='space-between' align='center'>
      <Box bg='purple.100' border='2px'>
        <Heading size='md' m={2} bg='purple.100'>
          <Text m='2'>Edit the Permissions of this Document</Text>
        </Heading>
      </Box>
      <Flex direction='row' align='center' m='5'>
        <Flex direction='column' align='center' m='2'>
          <DrawEditorsBox permissionType='EDIT'></DrawEditorsBox>
          <Box height='20px'> </Box>
          <DrawEditorsBox permissionType='VIEW'></DrawEditorsBox>
        </Flex>
        {/*<DrawOwnershipBox />*/}
      </Flex>
      <Grid templateColumns='repeat(3, 1fr)' gap={6}>
        <AddUserField />
        <DrawExitButton />
      </Grid>
    </Flex>
  );
}
