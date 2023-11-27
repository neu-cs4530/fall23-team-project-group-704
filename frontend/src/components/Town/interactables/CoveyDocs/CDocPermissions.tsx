/* eslint-disable react-hooks/exhaustive-deps */
import {
  Center,
  Divider,
  RadioGroup,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
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
  InputGroup,
  InputLeftAddon,
  // GridItem,
  List,
  ListItem,
  Input,
} from '@chakra-ui/react';
// import { ChevronDownIcon } from '@chakra-ui/icons';
//import EventEmitter from 'events';
import React, { useState } from 'react';
import { CDocUserID } from '../../../../../../shared/types/CoveyTownSocket';

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
  const [viewers, setViewers] = useState<CDocUserID[]>(props.viewers ? props.viewers : []);
  const [newViewers, setNewViewers] = useState<CDocUserID[]>(viewers);

  const [editors, setEditors] = useState<CDocUserID[]>(props.editors ? props.editors : []);
  const [newEditors, setNewEditors] = useState<CDocUserID[]>(editors);

  const [owner, setOwner] = useState<CDocUserID>(props.owner);
  const [newOwner, setNewOwner] = useState(owner);

  function DrawEditorsBox() {
    const UserRadioGroup = ({ userID }: { userID: CDocUserID }) => {
      const [selectedOption, setSelectedOption] = useState('no selection');

      const isMakeViewerDisabled = userID !== owner;
      const isRemoveAccessDisabled = userID !== owner;

      const handleSelectChange = (value: string) => {
        setSelectedOption(value === selectedOption ? '' : value);

        if (selectedOption === 'viewer') {
          setNewViewers([...newViewers, userID]);
          setNewEditors(newEditors.filter((aUser: CDocUserID) => aUser !== userID));
        } else if (selectedOption === '') {
          setNewEditors([...new Set([...newEditors, userID])]);
          setNewViewers(newViewers.filter((aUser: CDocUserID) => aUser !== userID));
        } else if (selectedOption === 'remove') {
          setNewViewers(newViewers.filter((aUser: CDocUserID) => aUser !== userID));
          setNewEditors(newEditors.filter((aUser: CDocUserID) => aUser !== userID));
        }
      };

      return (
        <RadioGroup onChange={handleSelectChange} value={selectedOption}>
          <Stack direction='row'>
            <Radio value='viewer' isDisabled={isMakeViewerDisabled}>
              Make viewer
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
          People who can edit:
        </Text>
        <Box maxH='100px' overflowY='auto' maxW='250px' overflowX='auto'>
          <List>
            {editors.map((user: CDocUserID) => {
              return (
                <ListItem key={user}>
                  <Center height='50px'>
                    {user}
                    <Divider orientation='vertical' />
                    <UserRadioGroup userID={user} />
                  </Center>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>
    );
  }

  function DrawViewersBox() {
    const UserRadioGroup = ({ userID }: { userID: CDocUserID }) => {
      const [selectedOption, setSelectedOption] = useState('no selection');

      const isMakeEditorDisabled =
        viewers.find((user: CDocUserID) => user === userID) !== undefined;
      const isRemoveAccessDisabled = userID !== owner;

      const handleSelectChange = (value: string) => {
        setSelectedOption(value === selectedOption ? '' : value);
        if (selectedOption === 'editor') {
          setNewEditors([...newEditors, userID]);
          setNewViewers(newViewers.filter((aUser: CDocUserID) => aUser !== userID));
        }
      };

      return (
        <RadioGroup onChange={handleSelectChange} value={selectedOption}>
          <Stack direction='row'>
            <Radio value='editor' isDisabled={isMakeEditorDisabled}>
              Make editor
            </Radio>
            <Radio value='remove' isDisabled={isRemoveAccessDisabled}>
              Remove access
            </Radio>
          </Stack>
        </RadioGroup>
      );
    };
    // const fakeViewers = ['i', 't', 'p'];
    //jo = []
    return (
      <Box>
        <Text fontSize='16px' fontWeight={'semibold'} bg='blue.100'>
          People who can view:
        </Text>
        <Box maxH='100px' overflowY='auto' maxW='250px' overflowX='auto'>
          <List>
            {viewers.map((user: CDocUserID) => {
              return (
                <ListItem key={user}>
                  <Center height='50px'>
                    {user}
                    <Divider orientation='vertical' />
                    <UserRadioGroup userID={user} />
                  </Center>
                </ListItem>
              );
            })}
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

  function TransferOwnershipButton() {
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
  }
  function DrawOwnershipBox() {
    return (
      <Box>
        <Heading size='md' m='2'>
          The Owner of this document is:
        </Heading>
        <Text bg='purple.100' border={'1px'} textAlign='center'>
          {owner}
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

  //to add: when clicking submit button, validate that the input user id is a real user
  //disable the buttons if the form is empty
  //allow the buttons to be unclicked
  //make it so that clicking the other button doesnt clear the form
  function AddUserField() {
    const AddUserRadioGroup = ({ userID }: { userID: CDocUserID }) => {
      const [selectedOption, setSelectedOption] = useState('no selection');

      const isMakeEditorDisabled = false;
      // how to check if this user is an editor?

      const handleSelectChange = (value: string) => {
        setSelectedOption(value === selectedOption ? '' : value);
        if (selectedOption === 'editor') {
          setNewEditors([...newEditors, userID]);
          setNewViewers(newViewers.filter((aUser: CDocUserID) => aUser !== userID));
        } else if (selectedOption === 'viewer') {
          setNewViewers([...newViewers, userID]);
          setNewEditors(newEditors.filter((aUser: CDocUserID) => aUser !== userID));
        } else if (selectedOption === '') {
          setNewEditors(newEditors.filter((aUser: CDocUserID) => aUser !== userID));
          setNewViewers(newViewers.filter((aUser: CDocUserID) => aUser !== userID));
        }
      };

      return (
        <RadioGroup onChange={handleSelectChange} value={selectedOption}>
          <Stack direction='row'>
            <Radio value='editor' isDisabled={isMakeEditorDisabled}>
              Add as Editor
            </Radio>
            <Radio value='viewer'>Add as Viewer</Radio>
          </Stack>
        </RadioGroup>
      );
    };

    const [formData, setFormData] = useState({ username: '' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFormDataChange = (e: any) => {
      const { name, value } = e.target;
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = (e: any) => {
      e.preventDefault();
      alert('hello!');
      setEditors(newEditors);
      setViewers(newViewers);
      props.permissionsWereChanged({ theOwner: owner, theEditors: editors, theViewers: viewers });
      console.log(formData);
    };

    return (
      <Box m='2'>
        <Text>Add a New User</Text>
        <ChakraProvider>
          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>User ID:</FormLabel>
              <Input
                type='text'
                name='username'
                value={formData.username}
                onChange={handleFormDataChange}
              />
            </FormControl>
            <AddUserRadioGroup userID={formData.username} />
            <Button type='submit'>Submit</Button>
          </form>
        </ChakraProvider>
      </Box>
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
      props.permissionsWereChanged({ theOwner: owner, theEditors: editors, theViewers: viewers });
    }

    return (
      <Button m={'2'} onClick={() => handleSaveClick()}>
        Save Changes
      </Button>
    );
  }

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
          <DrawEditorsBox />
          <Box height='20px'> </Box>
          <DrawViewersBox />
        </Flex>
        <DrawOwnershipBox />
      </Flex>
      <Grid templateColumns='repeat(3, 1fr)' gap={6}>
        <AddUserField />
        <DrawSaveButton />
        <DrawExitButton />
      </Grid>
    </Flex>
  );
}
