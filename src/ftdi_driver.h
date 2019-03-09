#ifndef FTDI_DRIVER_H
#define FTDI_DRIVER_H

#include <v8.h>
#include <node.h>
#include <ftd2xx.h>
/* Include libMPSSE header */
// #include <libMPSSE_spi.h>

#include "nan.h"

using namespace v8;
using namespace node;


void InitializeList(Handle<Object> target);

NAN_METHOD(FindAll);
NAN_METHOD(SetVidPid);

#endif
