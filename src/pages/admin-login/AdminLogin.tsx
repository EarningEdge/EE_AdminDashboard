import React, { useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Form as AntdForm, message } from 'antd';
import CustomButton from '../../components/ui/button/Button';
import FormLayout from '../../components/layout/form-layout/FormLayout';
import FormImg from '../../assets/images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { IUser } from '../../types/data';
import { useAppDispatch } from '../../redux/hooks';
import { login } from '../../redux/slices/authSlice';
import usePostData from '../../hooks/usePostData';
import { useNavigationFunctions } from '../../components/navigation/navigationFunctions';

interface IFormInput {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: IUser;
  token?: string;
}

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
}).required();

const AdminLogin: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data, loading, error, postData } = usePostData<IFormInput, LoginResponse>('/admin/login');
  const {navigateToMentorLogin} = useNavigationFunctions();

  const onSubmit: SubmitHandler<IFormInput> = async (formData) => {
    await postData(formData);
  };


  useEffect(() => {
    if (data?.success) {
      const { user, token } = data;
      if (user && token) {
        const userObject: IUser = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          _id: user._id,
          profile_image_url: user.profile_image_url,
          referralCode: ''
        };
        dispatch(login({ user: userObject, token }));
        navigate('/admin');
      }
    } else if (data) {
      message.error(data.message || 'Login failed');
    }
  }, [data, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      //@ts-ignore
      message.error(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  }, [error]);

  const form = (
    <div className='max-w-sm'>
      <AntdForm onFinish={handleSubmit(onSubmit)} layout='vertical'>
        <AntdForm.Item
          label={<span className='text-black text-base'>Email</span>}
          validateStatus={errors.email ? 'error' : ''}
          help={errors.email?.message}
        >
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <Input {...field} className='text-black focus:ring-2 h-[36px] focus:ring-blue-500 py-0' />
            )}
          />
        </AntdForm.Item>

        <AntdForm.Item
          label={<span className='text-black text-base'>Password</span>}
          validateStatus={errors.password ? 'error' : ''}
          help={errors.password?.message}
        >
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <Input.Password {...field} className='text-black focus:ring-2 h-[36px] focus:ring-blue-500 py-0' />
            )}
          />
        </AntdForm.Item>
        <AntdForm.Item className='mb-4 text-right'>
          <Link to='/' className='text-link'>Forgot Password?</Link>
        </AntdForm.Item>

        <AntdForm.Item>
          <CustomButton
            type='primary'
            htmlType='submit'
            className='w-full text-xl py-5 bg-dark-teal rounded-xl'
            isLoading={loading}
            disabled={loading}
          >
            Sign In
          </CustomButton>
        </AntdForm.Item>
        <AntdForm.Item>
          <CustomButton
            type='link'
            htmlType='button'
            className='w-full text-xl py-5 rounded-xl text-black border border-dark-teal'
            disabled={loading}
            onClick={navigateToMentorLogin}
          >
            Mentor Login
          </CustomButton>
        </AntdForm.Item>
        <AntdForm.Item className='text-center'>
          <p className='text-slate-blue'>
            Don't you have an account?
            <Link to='/' className='text-link'>Sign up</Link>
          </p>
        </AntdForm.Item>
      </AntdForm>
    </div>
  );

  return (
    <FormLayout
      image={FormImg}
      title='Welcome Back Admin'
      description={`Today is a new day. It's your day. You shape it. Sign in to start managing your projects.`}
      form={form}
      reverse={true}
    />
  );
};

export default AdminLogin;
