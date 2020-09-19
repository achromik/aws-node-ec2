import React from 'react';

export const FormError = ({ message }) => (
  <div className="alert alert-danger" role="alert">
    {message}
  </div>
);
