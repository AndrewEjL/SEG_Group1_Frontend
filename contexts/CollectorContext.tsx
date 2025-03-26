import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Collector{
  id: string;
  name: string;
  email: string;
  pendingPickups: string[];
}