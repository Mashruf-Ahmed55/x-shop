import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '../ui/button';

export const GoogleButton = () => {
  return (
    <Button size={'lg'} variant="outline">
      <FcGoogle size={24} />
      Sign in with Google
    </Button>
  );
};
export const FacebookButton = () => {
  return (
    <Button size={'lg'} variant="outline">
      <FaFacebook color="#0866FF" />
      Sign in with Facebook
    </Button>
  );
};
