import React, { useEffect, useState } from 'react';

import { UserService } from '../services/user.service';
import { getMessageFromError } from '../helpers/getMessageFromError';

export const Home = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    const getContent = async () => {
      try {
        const response = await UserService.getPublicContent();
        setContent(response.data);
      } catch (error) {
        const errContent = getMessageFromError(error);

        setContent(errContent);
      }
    };

    getContent();
  }, []);

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>{content}</h3>
      </header>
    </div>
  );
};
