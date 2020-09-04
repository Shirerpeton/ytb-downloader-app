import React from 'react';
import styled from 'styled-components';

const Label = styled.label`
  margin: 0;
  margin-right: 1rem;
  font-size: 1.5rem;
  padding: 0;
`

interface LinkInputProps {
  readonly gettingInfo: boolean;
};

const LinkInput = styled.input<LinkInputProps>`
  padding: 0.75rem;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => !props.gettingInfo ? props.theme.colors.primary : props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.25rem;
  width: 25rem;
  margin-right: 1rem;
  font-size: 1rem;
  &:focus {
    outline: none;
    border: 1px solid ${props => props.theme.colors.borderSecondary};
  }
`

const SubmitButton = styled.input`
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.primary};
  font-size: 1.25rem;
  border-radius: 0.25rem;
  padding: 0.5rem;
  &:focus {
    outline: none;
    border: 1px solid ${props => props.theme.colors.borderSecondary};
  }
`

const LinkForm = styled.form`
  display: flex;
  align-items: center;
  justify-content: center;
`

interface LinkFormProps {
  readonly handleSubmitInfo: (event: React.SyntheticEvent) => Promise<void>, 
  readonly link: string, 
  readonly setLink: React.Dispatch<React.SetStateAction<string>>, 
  readonly gettingInfo: boolean
}

const LinkFormComponent: React.FC<LinkFormProps> = (props: LinkFormProps) => {
  return (
    <LinkForm onSubmit={props.handleSubmitInfo} >
      <Label htmlFor='link' > Youtube link: </Label>
      <LinkInput type='text' id='link' value={props.link} onChange={(event) => { if (!props.gettingInfo) props.setLink(event.target.value) }} gettingInfo={props.gettingInfo} />
      <SubmitButton type='submit' value='Get info' />
    </LinkForm>
  );
}

export default LinkFormComponent;