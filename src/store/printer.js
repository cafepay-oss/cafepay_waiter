import mixin from "../mixin";
import axios from "axios";
import printerTemplate from "@/javascripts/printer";
import { message } from "ant-design-vue";

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    printerModuleBaseURL: 'http://localhost:38627/',
    machineId: null,
    cloudPrinters: [],
    localPrinters: null,
    printerLoading: true, // loading mode
    queue: [],
    ongoingJobs: [], // Jobs that are now being processed
  },
  // -----------------------------------------------------------------
  getters: {
    printerModuleBaseURL: state => {
      return state.printerModuleBaseURL
    },
    machineId: state => {
      return state.machineId;
    },
    cloudPrinters: state => {
      return state.cloudPrinters;
    },
    localPrinters: state => {
      return state.localPrinters;
    },
    printerLoading: state => {
      return state.printerLoading;
    },
    queue: state => {
      return state.queue;
    },
    ongoingJobs: state => {
      return state.ongoingJobs;
    },
  },
  // -----------------------------------------------------------------
  mutations: {
    setMachineId(state, newData) {
      state.machineId = newData;
    },
    setCloudPrinters(state, newData) {
      state.cloudPrinters = newData || [];
    },
    setLocalPrinters(state, newData) {
      state.localPrinters = newData;
    },
    setPrinterLoading(state, newData) {
      state.printerLoading = newData;
    },
  },
  // -----------------------------------------------------------------
  actions: {
    async printOrders(context, { orders, table, type = "1" }) {
      const printers = (context.state.cloudPrinters || []).filter(printer => printer.is_on
        && (printer.the_types || []).some(item => String(item.type) === String(type)));
      if (!orders.length) return false;
      if (!printers.length) {
        if (String(type) === "1") message.info("چاپگر فعالی برای صورتحساب ثبت نشده است");
        return false;
      }
      try {
        for (const printer of printers) {
          const rawData = printer.width === "8cm"
            ? printerTemplate.eightCMPrinter(orders, table) : printerTemplate.sixCMPrinter(orders, table);
          await mixin.methods.request({
            url: "api/v1/printer/" + printer.pk + "/job/create/",
            method: "POST", data: { raw_data: rawData }
          });
        }
        return true;
      } catch (error) {
        message.error("ارسال به چاپگر انجام نشد. وضعیت چاپگر را بررسی کنید");
        return false;
      }
    },
    /* Local Printes

			* payload: { username, password }
			* API response: { machineId , printers: [ { printer } ] }
		*/
    /* Local Printes

			* payload: null
			* API response: { machineId , printers: [ { printer } ] }
		*/
    getLocalPrinters(context, payload) {
      context.state.printerLoading = true; // activate loading mode

      axios.create({
        baseURL: context.getters.printerModuleBaseURL
      }).request({
        url: "printer-list/",
        method: "GET",
        // data: {
        //   phone_number: payload.phone_number,
        //   password: payload.password
        // }
      }).then(res => {
          context.commit("setMachineId", res.data.machineId);
          context.commit("setLocalPrinters", res.data.printers);
      })
      .catch(err => {
        //console.log(err)
      }).finally(()=> {
        context.commit("setPrinterLoading", false);
      });
    },
    handlePrintJobs(context, newPrinterJobs){
      if(newPrinterJobs){
        for(let i = 0; i < newPrinterJobs.length; i++){
          if(newPrinterJobs[i].uid == context.getters.machineId){
            for (let j = 0; j < newPrinterJobs[i].jobs.length; j++) {
              const job = newPrinterJobs[i].jobs[j];
              if(
                !context.state.queue.find(j => j.pk == job.pk) &&
                !context.state.ongoingJobs.find(j => j.pk == job.pk)
              ){
                context.state.queue.unshift(job)
              }
            }
          }
        }
      }
      while(context.state.queue.length){
        const job = context.state.queue.pop()
        context.state.ongoingJobs.push(job)
        if (job.raw_data == 'test'){
          axios.create({
            baseURL: context.getters.printerModuleBaseURL
          }).request({
            url: "print-sample/" + job.printer.name + "/?size=" + job.printer.width,
            method: "GET",
            // data: {
            //   phone_number: payload.phone_number,
            //   password: payload.password
            // }
          }).then(res => {
            if(res.data.status){
              job.is_done = true;
              mixin.methods
                .request({
                  url: "api/v1/printer-job/" + job.pk + "/",
                  method: "PUT",
                  data: job
                }).then(res => {
                  
                }).catch(err => {
                  //console.log(err)
                })
              context.state.ongoingJobs = context.state.ongoingJobs.filter(j => j.pk != job.pk);
            } else {
  
            }
          })
          .catch(err => {
            //console.log(err)
          })
        } else {
          axios.create({
            baseURL: context.getters.printerModuleBaseURL
          }).request({
            url: "print/" + job.printer.name + "/",
            method: "POST",
            data: {
              htmlContent: job.raw_data,
            }
          }).then(res => {
            if(res.data.status){
              job.is_done = true;
              mixin.methods
                .request({
                  url: "api/v1/printer-job/" + job.pk + "/",
                  method: "PUT",
                  data: job
                }).then(res => {
                }).catch(err => {
                  //console.log(err)
                })
              context.state.ongoingJobs = context.state.ongoingJobs.filter(j => j.pk != job.pk);
            } else {
  
            }
          })
          .catch(err => {
            //console.log(err)
          })
        }
      }
    }
  }
};
