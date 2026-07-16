import React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as Babel from '@babel/standalone';

import './migration-shell.css';
import { startLegacyApp } from './startLegacyApp.js';

window.React = React;
window.ReactDOM = ReactDOM;
window.Babel = Babel;

startLegacyApp();
