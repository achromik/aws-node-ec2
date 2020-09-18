import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

import { FormError } from '../common/FormError';
import { AuthService } from '../services/auth.service';

export const Register = () => {
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      email: '',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, 'Must be between 3 and 20 characters')
        .max(20, 'Must be between 3 and 20 characters')
        .required('Required'),
      password: Yup.string()
        .min(6, 'Must be between 6 and 40 characters.')
        .max(20, 'Must be between 6 and 40 characters.')
        .required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
    }),
    onSubmit: async values => {
      const { username, email, password } = values;
      setMessage('');
      setSuccessful(false);
      try {
        const res = await AuthService.register(username, email, password);
        console.log();

        const message = `User: ${res.data.username} was registered successfully`;
        setMessage(message);
        setSuccessful(true);
        formik.setSubmitting(false);
      } catch (error) {
        const resMessage =
          error.response?.data?.error?.message ||
          error.message ||
          error.toString();

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
          alt="profile-img"
          className="profile-img-card"
        />
        <form onSubmit={formik.handleSubmit}>
          {!successful && (
            <>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className="form-control"
                  {...formik.getFieldProps('username')}
                />
                {formik.touched.username && formik.errors.username && (
                  <FormError message={formik.errors.username} />
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  {...formik.getFieldProps('email')}
                />
                {formik.touched.email && formik.errors.email && (
                  <FormError message={formik.errors.email} />
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  {...formik.getFieldProps('password')}
                />
                {formik.touched.password && formik.errors.password && (
                  <FormError message={formik.errors.password} />
                )}
              </div>
              <div className="form-">
                <button className="btn btn-primary btn-block" type="submit">
                  {formik.isSubmitting && (
                    <span className="spinner-border spinner-border-sm"></span>
                  )}
                  <span>Sign up</span>
                </button>
              </div>
            </>
          )}

          {message && (
            <div className="form-group">
              <div
                className={
                  successful ? 'alert alert-success' : 'alert alert-danger'
                }
                role="alert"
              >
                {message}
              </div>
              {successful && (
                <div className="justify-content-center">
                  <Link
                    to={'/login'}
                    className="stretched-link text-center d-block"
                  >
                    <span class="card-link">Sign in</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
