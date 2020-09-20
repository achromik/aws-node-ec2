import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { AuthService } from '../services/auth.service';
import { FormError } from '../common/FormError';
import { getMessageFromError } from '../helpers/getMessageFromError';

export const Login = props => {
  const [message, setMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async values => {
      const { username, password } = values;
      setMessage('');

      try {
        await AuthService.login(username, password);
        props.history.push('/profile');
        window.location.reload();
      } catch (error) {
        const resMessage = getMessageFromError(error);

        setMessage(resMessage);
        formik.setSubmitting(false);
      }
    },
  });

  return (
    <div className="col-md-12">
      <div className="card card-container">
        <img
          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
          alt="profile_img"
          className="profile-img-card"
        />
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              Username
              <input
                id="username"
                type="text"
                className="form-control"
                {...formik.getFieldProps('username')}
              />
              {formik.touched.username && formik.errors.username && (
                <FormError message={formik.errors.username} />
              )}
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
              <input
                id="password"
                type="password"
                className="form-control"
                {...formik.getFieldProps('password')}
              />
              {formik.touched.password && formik.errors.password && (
                <FormError message={formik.errors.password} />
              )}
            </label>
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting && (
                <span className="spinner-border spinner-border-sm" />
              )}
              <span>Login</span>
            </button>
          </div>

          {message && (
            <div className="form-group">
              <div className="alert alert-danger" role="alert">
                {message}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

Login.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
