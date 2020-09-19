import React from 'react';
import PropTypes from 'prop-types';

export const FormError = ({ message }) => (
  <div className="alert alert-danger" role="alert">
    {message}
  </div>
);

FormError.propTypes = {
  message: PropTypes.string.isRequired,
};
