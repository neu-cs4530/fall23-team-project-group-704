import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';
import styled from 'styled-components';

const Form = styled.div`
  width: 100%;
  padding: 20px;
  align-content: center;
  display: flex;
  flex-direction: column;
  .signin {
    float: right;
  }
`;

interface SignInProps {
  signIn: () => void;
}
export default function CDocSignin({ signIn = () => {} }: SignInProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isUser, setIsUser] = useState(false);
  const isValidUsername = username !== ''; // or already exists
  const isValidPassword = username !== '';

  return (
    <Form>
      <Text fontSize='4xl'>Welcome to CoveyDocs! :)</Text>
      <FormControl isRequired>
        <FormLabel>Username</FormLabel>
        {!isValidUsername ? (
          <FormHelperText>
            {isUser ? 'Enter your username :)' : 'Enter the username you would like to go by.'}
          </FormHelperText>
        ) : (
          <FormErrorMessage>Username is required.</FormErrorMessage>
        )}
        <Input type='text' value={username} onChange={e => setUsername(e.target.value)} />
        {/*<FormHelperText>We'll never share your email.</FormHelperText>*/}
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Password</FormLabel>
        {!isValidPassword ? (
          <FormHelperText>
            {isUser ? 'Enter your password :)' : 'Enter the a secure password'}
          </FormHelperText>
        ) : (
          <FormErrorMessage>Password is required.</FormErrorMessage>
        )}
        <Input type='password' value={password} onChange={e => setPassword(e.target.value)} />
        {/*<FormHelperText>We'll never share your email.</FormHelperText>*/}
      </FormControl>
      <Button mt={4} colorScheme='teal' isLoading={false} type='submit' onClick={signIn}>
        Sign up
      </Button>
      <Button className={'signin'} onClick={() => setIsUser(true)}>
        Sign in
      </Button>
    </Form>
  );
}
