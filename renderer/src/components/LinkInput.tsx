import React, { useEffect } from 'react';
import styled from 'styled-components';

const remote = window.require('electron').remote;
const clipboard = window.require('electron').clipboard;

interface LinkInputProps {
    readonly gettingInfo: boolean,
    readonly error: string
};

const LinkInput = styled.input<LinkInputProps>`
  padding: 0.50rem;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => !props.gettingInfo ? props.theme.colors.primary : props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.25rem;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
  border-right: 0;
  width: 25rem;
  font-size: 1.25rem;
  ${props => props.error !== '' ?
        'border: 1px solid' + props.theme.colors.error + '};'
        :
        null}
  &:focus {
    outline: none;
    border: 1px solid ${props => props.theme.colors.borderSecondary};
  }
  &:after {
    content: ${props => props.error};
  }
`

const Error = styled.span`
    color: ${props => props.theme.colors.error};
`

const LinkInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

interface LinkFormProps {
    readonly link: string,
    readonly setLink: React.Dispatch<React.SetStateAction<string>>,
    readonly isGettingInfo: boolean,
    readonly error: string,
    readonly setError: React.Dispatch<React.SetStateAction<string>>
}

const LinkInputComponent: React.FC<LinkFormProps> = ({ link, setLink, isGettingInfo, error, setError }: LinkFormProps) => {

    useEffect(() => {
        const { Menu, MenuItem } = remote;

        const menu = new Menu();
        menu.append(new MenuItem({ label: 'Paste', click() { setLink(clipboard.readText()); } }));

        const menuCallback = (e: MouseEvent) => {
            e.preventDefault();
            if ((e.target as HTMLInputElement).id === 'link')
                menu.popup({ window: remote.getCurrentWindow() })
        }
        window.addEventListener('contextmenu', menuCallback, false);
        return (() => {
            window.removeEventListener("contextmenu", menuCallback);
        })
    }, [setLink]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (!isGettingInfo)
            setError('');
        setLink(event.target.value);
    }

    return (
        <LinkInputContainer>
            <LinkInput type='text' id='link' value={link} onChange={handleChange} gettingInfo={isGettingInfo} error={error} placeholder='Youtube link' onFocus={event => event.target.select()} />
            {error !== '' ? <Error>{error}</Error> : null}
        </LinkInputContainer>
    );
}

export default LinkInputComponent;