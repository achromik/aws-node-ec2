import React, { useState, useEffect } from 'react';

import { UserService } from '../../services/user.service';
import { getMessageFromError } from '../../helpers/getMessageFromError';

export const BoardAdmin = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    const getContent = async () => {
      try {
        const response = await UserService.getAdminBoard();

        setContent(response.data);
      } catch (error) {
        const errorContent = getMessageFromError(error);

        setContent(errorContent);
      }
    };

    getContent();
  }, []);
  return (
    <div className="container">
      <div className="jumbotron">
        <h3>{content}</h3>
      </div>
    </div>
  );
};
