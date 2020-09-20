import React, { useEffect, useState } from 'react';

import { UserService } from '../../services/user.service';
import { getMessageFromError } from '../../helpers/getMessageFromError';

export const BoardUser = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    const getUserBoardContent = async () => {
      try {
        const response = await UserService.getUserBoard();
        setContent(response.data);
      } catch (error) {
        const errorContent = getMessageFromError(error);

        setContent(errorContent);
      }
    };
    getUserBoardContent();
  }, []);

  return (
    <div className="container">
      <div className="jumbotron">
        <h3>{content}</h3>
      </div>
    </div>
  );
};
