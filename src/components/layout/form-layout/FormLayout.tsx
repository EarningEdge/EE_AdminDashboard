// components/layout/form-layout/FormLayout.tsx
import React from 'react';

interface FormLayoutProps {
  form: React.ReactNode;
  image: string;
  reverse?: boolean;
  title: string;
  description: string;
}

const FormLayout: React.FC<FormLayoutProps> = ({ form, image, reverse, title, description }) => {
  return (
    <div className={`min-h-screen flex ${reverse ? 'flex-row-reverse' : 'flex-row'} items-center justify-evenly py-14 lg:px-96`}>
      <div className='max-w-lg p-8 text-black rounded-lg w-[45%]'>
        <div className='max-w-sm'>
          <h2 className=' mb-6 text-4xl text-dark-blue-gray'>{title}</h2>
          <p className='mb-6 text-slate-blue'>{description}</p>
          {form}
        </div>
      </div>
      <div className='h-[96vh] rounded-3xl bg-black flex justify-center items-center w-[45%]'>
        <img
          src={image}
          alt='form-img'
          className=' object-cover rounded-3xl'
        />
      </div>
    </div>
  );
};

export default FormLayout;
