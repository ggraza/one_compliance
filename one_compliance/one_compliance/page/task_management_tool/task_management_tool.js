frappe.pages['task-management-tool'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Task Management Tool',
		single_column: true
	});

	// Button to refresh the page
	let $button = page.set_secondary_action('Refresh',() => location.reload())

	page.main.addClass("frappe-card");

	// Filter options
	make_filters(page);

	// Refresh task
  refresh_tasks(page);
}

function make_filters(page) {
	var project_id = localStorage.getItem('selected_project_id');
	let taskField = page.add_field({
		label: __("Task"),
		fieldname: "task",
		fieldtype: "Link",
		options: "Task",
		change() {
			if (page.fields_dict.task.get_value()) {
          refresh_tasks(page);
      }
		}
	});
	page.fields_dict.task.$input.on('change', function() {
		if (!page.fields_dict.task.get_value()) {
				refresh_tasks(page);
		}
  });
	let projectField = page.add_field({
		label: __("Project"),
		fieldname: "project",
		fieldtype: "Link",
		options: "Project",
		default:project_id,
		change() {
			if (page.fields_dict.project.get_value()) {
          refresh_tasks(page);
      }
		}
	});
	localStorage.removeItem('selected_project_id');
	page.fields_dict.project.$input.on('change', function() {
		if (!page.fields_dict.project.get_value()) {
			refresh_tasks(page);
		}
  });
	let customerField = page.add_field({
		label: __("Customer"),
		fieldname: "customer",
		fieldtype: "Link",
		options:"Customer",
		change() {
			if (page.fields_dict.customer.get_value()) {
          refresh_tasks(page);
      }
		}
	});
	page.fields_dict.customer.$input.on('change', function() {
		if (!page.fields_dict.customer.get_value()) {
				refresh_tasks(page);
		}
  });
	let employeeField = page.add_field({
		label: __("Employee"),
		fieldname: "employee",
		fieldtype: "Link",
		options: "User",
		default: get_employee_id(),
		change() {
			if (page.fields_dict.employee.get_value()) {
          refresh_tasks(page);
      }
		},
		read_only: frappe.session.user === 'Administrator' ? 0 : 1
	});
	page.fields_dict.employee.$input.on('change', function() {
		if (!page.fields_dict.employee.get_value()) {
				refresh_tasks(page);
		}
  });
	let employeeGroupField = page.add_field({
		label: __("Employee Group"),
		fieldname: "employee_group",
		fieldtype: "Link",
		options: "Employee Group",
		change() {
			if (page.fields_dict.employee_group.get_value()) {
          refresh_tasks(page);
      }
		}
	});
	page.fields_dict.employee_group.$input.on('change', function() {
		if (!page.fields_dict.employee_group.get_value()) {
				refresh_tasks(page);
		}
  });
	let categoryField = page.add_field({
		label: __("Department"),
		fieldname: "department",
		fieldtype: "Link",
		options: "Department",
		change() {
			if (page.fields_dict.department.get_value()) {
          refresh_tasks(page);
      }
		}
	});
	page.fields_dict.department.$input.on('change', function() {
		if (!page.fields_dict.department.get_value()) {
				refresh_tasks(page);
		}
  });
	let subcategoryField = page.add_field({
		label: __("Compliance Sub Category"),
		fieldname: "compliance_sub_category",
		fieldtype: "Link",
		options: "Compliance Sub Category",
		change() {
			if (page.fields_dict.compliance_sub_category.get_value()) {
          refresh_tasks(page);
      }
		}
	});
	page.fields_dict.compliance_sub_category.$input.on('change', function() {
		if (!page.fields_dict.compliance_sub_category.get_value()) {
				refresh_tasks(page);
		}
  });
	let fromDateField = page.add_field({
		label: __("From Date"),
		fieldname: "from_date",
		fieldtype: "Date"
	});
	page.fields_dict.from_date.$input.off('change').on('change', function() {
        refresh_tasks(page);
    });
	let toDateField = page.add_field({
		label: __("To Date"),
		fieldname: "to_date",
		fieldtype: "Date"
	});
	page.fields_dict.to_date.$input.off('change').on('change', function() {
      refresh_tasks(page);
  });
	let status = page.add_field({
		label: __("Status"),
		fieldname: "status",
		fieldtype: "Select",
		options: [
				{},
				{ label: "Open", value: "open" },
				{ label: "Working", value: "working" },
				{ label: "Pending Review", value: "pending_review" },
				{ label: "Overdue", value: "overdue" },
				{ label: "Hold", value: "hold" },
				{ label: "Completed", value: "completed" },
				{ label: "Cancelled", value: "cancelled" },
			],
			default: "",
		change() {
			refresh_tasks(page);
		}
	});
}

function get_employee_id() {
    if (frappe.session.user === 'Administrator') {
        return '';
    }
		else {
				return frappe.session.user
		}
}

function refresh_tasks(page){
	// Clear existing tasks from the page
  page.body.find(".frappe-list").remove();

	const selectedStatus = page.fields_dict.status.get_value();
	const taskName = page.fields_dict.task.get_value();
	const projectName = page.fields_dict.project.get_value();
	const customerName = page.fields_dict.customer.get_value();
	const department = page.fields_dict.department.get_value();
	const subCategory = page.fields_dict.compliance_sub_category.get_value();
	const employee = page.fields_dict.employee.get_value();
	const employeeGroup = page.fields_dict.employee_group.get_value();
	const from_date = page.fields_dict.from_date.get_value();
	const to_date = page.fields_dict.to_date.get_value();

	frappe.call({
			method: "one_compliance.one_compliance.page.task_management_tool.task_management_tool.get_task",
			 args: { status: selectedStatus,
				 			 task: taskName,
							 project: projectName,
							 customer: customerName,
							 department: department,
							 sub_category: subCategory,
							 employee: employee,
							 employee_group: employeeGroup,
							 from_date: from_date,
							 to_date: to_date
							},
			 callback: (r) => {
				if (r.message && r.message.length>0) {
						// Render the list of tasks to html page
						$(frappe.render_template("task_management_tool", {task_list:r.message})).appendTo(page.body);

						// Button action to add payment details
						page.body.find(".paymentEntryButton").on("click", function () {
							var taskId = $(this).attr("task-id");
							var payableAmount = $(this).attr("payable-amount");
							var modeOfPayment = $(this).attr("mode-of-payment");
							var referenceNumber = $(this).attr("ref-num");
							var referenceDate = $(this).attr("ref-date");
							var userRemark = $(this).attr("remark");
							paymentEntryDialog(taskId, payableAmount, modeOfPayment, referenceNumber, referenceDate, userRemark);
            });

						// Button action to add assignees
						page.body.find(".addAssigneeBtn").on("click", function () {
							var taskName = $(this).attr("task-id");
              showAssignEntryDialog(taskName);
            });

						// Initially hide the timesheet button
						page.body.find(".timeEntryButton").hide();

						// Button action to start the time
						page.body.find(".startButton").on("click", function () {
	            var taskName = $(this).attr("task-id");
	            var projectName = $(this).attr("project-id");

							var status = page.fields_dict.status.get_value();
					    if (status === 'completed' || status === 'hold' || status === 'cancelled') {
					        return; // If the task status is completed, hold, or cancelled, do not proceed
					    }

	            var currentTime = frappe.datetime.now_datetime();
	            var formattedTime = frappe.datetime.str_to_user(currentTime);

							// Save start time in local storage
    					localStorage.setItem("start-time-task-" + taskName + "-project-" + projectName, currentTime);

	            // Find the specific "start-time" paragraph associated with the task and project
	            var startTimeParagraph = page.body.find(".start-time[task-id='" + taskName + "'][project-id='" + projectName + "']");
	            startTimeParagraph.text(formattedTime);

							// Update the status of task to 'Working'
							updateTaskStatus(page,taskName, projectName, "Working");

							// Hide the button once clicked
							$(this).hide();
							// Show the time sheet button
							page.body.find(".timeEntryButton[task-id='" + taskName + "'][project-id='" + projectName + "']").show();
		        });

						// Action of start-time field
						page.body.find(".start-time").each(function () {
				        var taskName = $(this).attr("task-id");
				        var projectName = $(this).attr("project-id");
				        var startTime = localStorage.getItem("start-time-task-" + taskName + "-project-" + projectName);

								// Check if a start time is retrieved from local storage
								if (startTime) {
						        var storedDate = new Date(startTime);
						        var currentDate = new Date();

										// Check if the retrieved start time belongs to the current day
						        if (storedDate.getDate() !== currentDate.getDate() || storedDate.getMonth() !== currentDate.getMonth() || storedDate.getFullYear() !== currentDate.getFullYear()) {
						            // If startTime doesn't belong to the current day, reset the values
						            localStorage.removeItem("start-time-task-" + taskName + "-project-" + projectName);
						            startTime = null;
						        }
						    }
								// Check if a valid start time exists
				        if (startTime) {
				            var formattedTime = frappe.datetime.str_to_user(startTime);
				            $(this).text(formattedTime);
										page.body.find(".startButton[task-id='" + taskName + "'][project-id='" + projectName + "']").hide(); // Hide the start button associated with the task and project
        						page.body.find(".timeEntryButton[task-id='" + taskName + "'][project-id='" + projectName + "']").show(); // Show the time entry button associated with the task and project
				        }
								else {
										// If no valid start time exists
										$(this).text("");
										page.body.find(".startButton[task-id='" + taskName + "'][project-id='" + projectName + "']").show(); // Show the start button associated with the task and project
										page.body.find(".timeEntryButton[task-id='" + taskName + "'][project-id='" + projectName + "']").hide(); // Hide the time entry button associated with the task and project
								}
				    });

						// Button action to enter timesheet
						page.body.find(".timeEntryButton").on("click", function () {
							var taskName = $(this).attr("task-id");
							var projectName = $(this).attr("project-id");
							var assignees = $(this).attr("assignees");
							// Retrieve start time from local storage
    					var startTime = localStorage.getItem("start-time-task-" + taskName + "-project-" + projectName);
              showTimeEntryDialog(page, taskName, projectName, assignees, startTime);
            });

						// Button action to view Customer documents
						page.body.find(".documentButton").on("click", function () {
							var subCategory = $(this).attr("sub-category");
							var customer = $(this).attr("customer");
              cusomerDocuments(subCategory, customer);
            });

						// Button action to view Customer credentials
						page.body.find(".credentialButton").on("click", function () {
							var subCategory = $(this).attr("sub-category");
							var customer = $(this).attr("customer");
              cusomerCredentials(subCategory, customer);
            });

						// Function to set colors to the status
						set_status_colors(page);
						// Function to hide assignee button for complated tasks
						hide_add_assignee_button(page.fields_dict.status.get_value());
						// Function to show assignee section or completed section based on task status
						assignee_and_completed_by_section(page.fields_dict.status.get_value());
				} else {
            // If no tasks are found, append a message to the page body
            $('<div class="frappe-list"></div>').appendTo(page.body).append('<div class="no-result text-muted flex justify-center align-center" style="text-align: center;"><p>No Task found with matching filters.</p></div>');
        }
			},
			freeze: true,
			freeze_message: 'Loading Task List'
		});

}

function refresh_tasks_manually(page, selectedStatus, taskName, projectName, customerName, department, subCategory, employee, employeeGroup, from_date, to_date){
	// Clear existing tasks from the page
  page.body.find(".frappe-list").remove();

	// const selectedStatus = page.fields_dict.status.get_value();
	// const taskName = page.fields_dict.task.get_value();
	// const projectName = page.fields_dict.project.get_value();
	// const customerName = page.fields_dict.customer.get_value();
	// const department = page.fields_dict.department.get_value();
	// const subCategory = page.fields_dict.compliance_sub_category.get_value();
	// const employee = page.fields_dict.employee.get_value();
	// const employeeGroup = page.fields_dict.employee_group.get_value();
	// const from_date = page.fields_dict.from_date.get_value();
	// const to_date = page.fields_dict.to_date.get_value();

	frappe.call({
			method: "one_compliance.one_compliance.page.task_management_tool.task_management_tool.get_task",
			 args: { status: selectedStatus,
				 			 task: taskName,
							 project: projectName,
							 customer: customerName,
							 department: department,
							 sub_category: subCategory,
							 employee: employee,
							 employee_group: employeeGroup,
							 from_date: from_date,
							 to_date: to_date
							},
			 callback: (r) => {
				if (r.message && r.message.length>0) {
						// Render the list of tasks to html page
						$(frappe.render_template("task_management_tool", {task_list:r.message})).appendTo(page.body);

						// Button action to add payment details
						page.body.find(".paymentEntryButton").on("click", function () {
							var taskId = $(this).attr("task-id");
							var payableAmount = $(this).attr("payable-amount");
							var modeOfPayment = $(this).attr("mode-of-payment");
							var referenceNumber = $(this).attr("ref-num");
							var referenceDate = $(this).attr("ref-date");
							var userRemark = $(this).attr("remark");
							paymentEntryDialog(taskId, payableAmount, modeOfPayment, referenceNumber, referenceDate, userRemark);
            });

						// Button action to add assignees
						page.body.find(".addAssigneeBtn").on("click", function () {
							var taskName = $(this).attr("task-id");
              showAssignEntryDialog(taskName);
            });

						// Initially hide the timesheet button
						page.body.find(".timeEntryButton").hide();

						// Button action to start the time
						page.body.find(".startButton").on("click", function () {
	            var taskName = $(this).attr("task-id");
	            var projectName = $(this).attr("project-id");

							var status = page.fields_dict.status.get_value();
					    if (status === 'completed' || status === 'hold' || status === 'cancelled') {
					        return; // If the task status is completed, hold, or cancelled, do not proceed
					    }

	            var currentTime = frappe.datetime.now_datetime();
	            var formattedTime = frappe.datetime.str_to_user(currentTime);

							// Save start time in local storage
    					localStorage.setItem("start-time-task-" + taskName + "-project-" + projectName, currentTime);

	            // Find the specific "start-time" paragraph associated with the task and project
	            var startTimeParagraph = page.body.find(".start-time[task-id='" + taskName + "'][project-id='" + projectName + "']");
	            startTimeParagraph.text(formattedTime);

							// Update the status of task to 'Working'
							updateTaskStatus(page,taskName, projectName, "Working");

							// Hide the button once clicked
							$(this).hide();
							// Show the time sheet button
							page.body.find(".timeEntryButton[task-id='" + taskName + "'][project-id='" + projectName + "']").show();
		        });

						// Action of start-time field
						page.body.find(".start-time").each(function () {
				        var taskName = $(this).attr("task-id");
				        var projectName = $(this).attr("project-id");
				        var startTime = localStorage.getItem("start-time-task-" + taskName + "-project-" + projectName);

								// Check if a start time is retrieved from local storage
								if (startTime) {
						        var storedDate = new Date(startTime);
						        var currentDate = new Date();

										// Check if the retrieved start time belongs to the current day
						        if (storedDate.getDate() !== currentDate.getDate() || storedDate.getMonth() !== currentDate.getMonth() || storedDate.getFullYear() !== currentDate.getFullYear()) {
						            // If startTime doesn't belong to the current day, reset the values
						            localStorage.removeItem("start-time-task-" + taskName + "-project-" + projectName);
						            startTime = null;
						        }
						    }
								// Check if a valid start time exists
				        if (startTime) {
				            var formattedTime = frappe.datetime.str_to_user(startTime);
				            $(this).text(formattedTime);
										page.body.find(".startButton[task-id='" + taskName + "'][project-id='" + projectName + "']").hide(); // Hide the start button associated with the task and project
        						page.body.find(".timeEntryButton[task-id='" + taskName + "'][project-id='" + projectName + "']").show(); // Show the time entry button associated with the task and project
				        }
								else {
										// If no valid start time exists
										$(this).text("");
										page.body.find(".startButton[task-id='" + taskName + "'][project-id='" + projectName + "']").show(); // Show the start button associated with the task and project
										page.body.find(".timeEntryButton[task-id='" + taskName + "'][project-id='" + projectName + "']").hide(); // Hide the time entry button associated with the task and project
								}
				    });

						// Button action to enter timesheet
						page.body.find(".timeEntryButton").on("click", function () {
							var taskName = $(this).attr("task-id");
							var projectName = $(this).attr("project-id");
							var assignees = $(this).attr("assignees");
							// Retrieve start time from local storage
    					var startTime = localStorage.getItem("start-time-task-" + taskName + "-project-" + projectName);
              showTimeEntryDialog(page, taskName, projectName, assignees, startTime);
            });

						// Button action to view Customer documents
						page.body.find(".documentButton").on("click", function () {
							var subCategory = $(this).attr("sub-category");
							var customer = $(this).attr("customer");
              cusomerDocuments(subCategory, customer);
            });

						// Button action to view Customer credentials
						page.body.find(".credentialButton").on("click", function () {
							var subCategory = $(this).attr("sub-category");
							var customer = $(this).attr("customer");
              cusomerCredentials(subCategory, customer);
            });

						// Function to set colors to the status
						set_status_colors();
						// Function to hide assignee button for complated tasks
						hide_add_assignee_button(page.fields_dict.status.get_value());
						// Function to show assignee section or completed section based on task status
						assignee_and_completed_by_section(page.fields_dict.status.get_value());
				} else {
            // If no tasks are found, append a message to the page body
            $('<div class="frappe-list"></div>').appendTo(page.body).append('<div class="no-result text-muted flex justify-center align-center" style="text-align: center;"><p>No Task found with matching filters.</p></div>');
        }
			},
			freeze: true,
			freeze_message: 'Loading Task List'
		});

}

function hide_add_assignee_button(taskStatus) {
    if (taskStatus === 'completed' || taskStatus === 'hold' || taskStatus === 'cancelled') {
				$('.startButton').hide();
        $('.addAssigneeBtn').hide();
    } else {
        $('.addAssigneeBtn').show();
    }
}

function assignee_and_completed_by_section(taskStatus) {
    if (taskStatus === 'completed') {
        $('.assignee-section').hide();
    } else {
        $('.completed-by-section').hide();
    }
}

function paymentEntryDialog(taskId, payableAmount, modeOfPayment, referenceNumber, referenceDate, userRemark){
	var dialog = new frappe.ui.Dialog({
        title: __("Add Payment Info"),
        fields: [
					{
							label: __("Task"),
							fieldname: "task",
							fieldtype: 'Link',
							options: 'Task',
							default: taskId,
							read_only: 1,
					},
					{
							label: __("Payable Amount"),
							fieldname: "payable_amount",
							fieldtype: 'Currency',
							reqd: true,
							default: payableAmount,
					},
					{
							label: __("Mode of payment"),
							fieldname: "mode_of_payment",
							fieldtype: 'Link',
							options: 'Mode of Payment',
							reqd: true,
							default: modeOfPayment
					},
					{
						fieldtype: "Column Break",
						fieldname: "col_break_1",
					},
					{
							label: __("Reference Number"),
							fieldname: "reference_number",
							fieldtype: 'Data',
							default: referenceNumber
					},
					{
							label: __("Reference Date"),
							fieldname: "reference_date",
							fieldtype: 'Date',
							default: referenceDate
					},
					{
							label: __("User remark"),
							fieldname: "user_remark",
							fieldtype: 'Small Text',
							default: userRemark
					}
        ],
        primary_action: function (values) {
						frappe.call({
								method: "one_compliance.one_compliance.page.task_management_tool.task_management_tool.add_payment_info",
								args: {
                    task_id: taskId,
                    payable_amount: values.payable_amount,
										mode_of_payment: values.mode_of_payment,
										reference_number: values.reference_number,
										reference_date: values.reference_date,
										user_remark: values.user_remark,
                },
                callback: function (r) {
                    frappe.msgprint("Payment info added successfully!");
										frm.reload_doc();
                }
						});
            dialog.hide();
        },
        primary_action_label: __("Save")
    });
    dialog.show();
}

function showAssignEntryDialog(taskName){
	var dialog = new frappe.ui.Dialog({
        title: __("Add Employees"),
        fields: [
						{
								label: __("Assign To"),
								fieldname: "assign_to",
								fieldtype: 'MultiSelectPills',
								get_data: function (txt) {
									return frappe.db.get_link_options("User", txt, {
										user_type: "System User",
										enabled: 1,
									});
								},
						}
        ],
        primary_action: function (values) {
						frappe.call({
								method: "frappe.desk.form.assign_to.add",
								args: {
                    doctype: "Task",
                    name: taskName,
                    assign_to: values.assign_to,
                },
                callback: function (r) {
                    frappe.msgprint("Assignment added successfully!");
										location.reload();
                }
						});
            dialog.hide();
        },
        primary_action_label: __("Add")
    });
    dialog.show();
}
// Function to show the dialog box for timesheet entry
function showTimeEntryDialog(page, taskName, projectName, assignees, startTime) {
	var assigneesList = assignees ? assignees.split(',') : [];

	var status = page.fields_dict.status.get_value();
  if (status === 'completed' | status === 'hold'| status === 'cancelled') {
      return;
  }

	// Get the pre-filled from_time and to_time values
  var fromTime = startTime
  var toTime = frappe.datetime.now_datetime(); // Get the current date and time for the to_time field

	var dialog = new frappe.ui.Dialog({
        title: __("Time Entry Dialog"),
        fields: [
						{
								label: __("Employee"),
								fieldname: "employee",
								fieldtype: 'Select',
								options: assigneesList,
                default: get_employee(assigneesList, function (employee) {
                    dialog.set_value("employee", employee);
                })
						},
            {
                label: __("Project"),
                fieldname: "project",
                fieldtype: 'Link',
                options: 'Project',
								default: projectName
            },
            {
                label: __("From Time"),
                fieldname: "from_time",
                fieldtype: 'Datetime',
                reqd: true,
								read_only: 1,
								default: fromTime,
            },
						{
							fieldtype: "Column Break",
							fieldname: "col_break_1",
						},
						{
                label: __("Task"),
                fieldname: "task",
                fieldtype: 'Link',
                options: 'Task',
								default: taskName
            },
						{
                label: __("Activity"),
                fieldname: "activity",
                fieldtype: 'Link',
                reqd: true,
								options: 'Activity Type'
            },
            {
                label: __("To Time"),
                fieldname: "to_time",
                fieldtype: 'Datetime',
                reqd: true,
								read_only: 1,
								default: toTime
            }
        ],
        primary_action: function (values) {
						// Clear start time from local storage upon submitting timesheet
						localStorage.removeItem("start-time-task-" + taskName + "-project-" + projectName);

						frappe.call({
								method: "one_compliance.one_compliance.page.task_management_tool.task_management_tool.create_timesheet",
								args: {
										project: values.project,
										task: values.task,
										employee: values.employee,
										activity: values.activity,
										from_time: values.from_time,
										to_time: values.to_time
								},
								callback: function (r) {
										frappe.msgprint("Timesheet created successfully!");
										// After creating timesheet show start button and hide start-time and time entry button
										page.body.find(".start-time[task-id='" + taskName + "'][project-id='" + projectName + "']").hide();
										page.body.find(".startButton[task-id='" + taskName + "'][project-id='" + projectName + "']").show();
										page.body.find(".timeEntryButton[task-id='" + taskName + "'][project-id='" + projectName + "']").hide();

								}
						});
            dialog.hide();
        },
        primary_action_label: __("Submit")
    });

    // Show the dialog
    dialog.show();
}

// Function to get frappe.session.user in the employee field to filter the task
function get_employee(assigneesList, callback) {
	if (frappe.session.user === 'Administrator') {
			return assigneesList[0]
	}
	else {
			frappe.call({
					method: "frappe.client.get_value",
					args: {
							doctype: "Employee",
							filters: { "user_id": frappe.session.user },
							fieldname: "employee_name"
					},
					callback: function (response) {
							var employeeName = response.message ? response.message.employee_name : null;
							callback(employeeName);
					}
			});
	}
}

function set_status_colors(page) {
		const taskElements = document.querySelectorAll('.card.task-entry');

		taskElements.forEach(taskElement => {
				const statusElement = taskElement.querySelector('[status-span]');
				const status = statusElement.getAttribute('status-span');
				const projectElement = taskElement.querySelector('.card-subtitle');
				let projectColor = projectElement.getAttribute('color')

        if (status === 'Open') {
					statusElement.style.color = 'blue';
					showTicIcon(statusElement);
					projectElement.style.color = 'blue';
        } else if (status === 'Completed') {
            statusElement.style.color = 'green';
						projectElement.style.color = 'green';
        } else if (status === 'Overdue') {
            statusElement.style.color = 'red';
						showTicIcon(statusElement);
						projectElement.style.color = 'red';
        } else if (status === 'Working') {
            statusElement.style.color = 'tomato';
						showTicIcon(statusElement);
						projectElement.style.color = 'tomato';
        }

				if (projectColor) {
		        projectElement.style.color = projectColor;
		    }
    });
		// Show tic icon for status updation.
		function showTicIcon(element) {
			if (!element.querySelector('.fa-check-circle')) {
        const ticIcon = document.createElement('i');
        ticIcon.className = 'fas fa-check-circle';
        ticIcon.style.color = 'green';
        ticIcon.style.cursor = 'pointer';
				ticIcon.title = 'Update Status';

        element.appendChild(document.createTextNode(' '));
        element.appendChild(ticIcon);

        const taskName = element.getAttribute('task-name');
        const taskId = element.getAttribute('task-id');
        const projectId = element.getAttribute('project-id');
				// Status updation to completed action for tic icon
        ticIcon.addEventListener('click', function () {
            update_status(page, taskName, projectId, taskId);
        });
			}
    }
}

function cusomerDocuments(subCategory, customer) {
	frappe.call({
		method:'one_compliance.one_compliance.utils.view_customer_documents',
		args:{
			'customer': customer,
			'compliance_sub_category': subCategory
		},
		callback:function(r){
			if (r.message){
					var newd = new frappe.ui.Dialog({
						 title: 'Document details',
						 fields: [
							 {
								 label: 'Document Attachment',
								 fieldname: 'document_attachment',
								 fieldtype: 'Data',
								 read_only: 1,
								 default:r.message[0]
							 },
						 ],
						 primary_action_label : 'Download',
						 primary_action(value){
							 window.open(r.message[0])
						 }
					 });
					 newd.show();
				 }
			 }
	 });
}

function cusomerCredentials(subCategory, customer){
	let d = new frappe.ui.Dialog({
		title: 'Enter details',
		fields: [
			{
				label: 'Purpose',
				fieldname: 'purpose',
				fieldtype: 'Link',
				options: 'Credential Type',
				get_query: function () {
					return {
						filters: {
							'compliance_sub_category': subCategory
						}
					};
				}
			}
		],
		primary_action_label: 'View Credential',
		primary_action(values) {
			frappe.call({
				method:'one_compliance.one_compliance.utils.view_credential_details',
				args:{
					'customer': customer,
					'purpose': values.purpose
				},
				callback:function(r){
					if (r.message){
						d.hide();
						let newd = new frappe.ui.Dialog({
							title: 'Credential details',
							fields: [
								{
									label: 'Username',
									fieldname: 'username',
									fieldtype: 'Data',
									read_only: 1,
									default:r.message[0]
								},
								{
									label: 'Password',
									fieldame: 'password',
									fieldtype: 'Data',
									read_only: 1,
									default:r.message[1]
								},
								{
									label: 'Url',
									fieldname: 'url',
									fieldtype: 'Data',
									options: 'URL',
									read_only: 1,
									default:r.message[2]
								 }
								],
								 primary_action_label: 'Close',
								 primary_action(value) {
									 newd.hide();
								 },
								 secondary_action_label : 'Go To URL',
								 secondary_action(value){
									 window.open(r.message[2])
								 }
							 });
							 newd.show();
						 }
					 }
				 })
			 }
		 });
		 d.show();
}

function update_status(page, taskName, projectId, taskId) {
	let fields = [
	    {
	        label: 'Status',
	        fieldname: 'status',
	        fieldtype: 'Select',
	        options: 'Open\nWorking\nPending Review\nCompleted\nHold',
	        default: 'Completed'
	    },
	    {
	        label: 'Completed By',
	        fieldname: 'completed_by',
	        fieldtype: 'Link',
	        options: 'User'
	    },
	    {
	        label: 'Completed On',
	        fieldname: 'completed_on',
	        fieldtype: 'Date',
	        default: 'Today'
	    }
	];

	let d = new frappe.ui.Dialog({
		title: 'Enter details',
		fields: fields,
		primary_action_label: 'Update',
		primary_action(values) {
			frappe.call({
		    method: 'one_compliance.one_compliance.doc_events.task.update_task_status',
		    args: {
		      'task_id': taskId,
		      'status': values.status,
		      'completed_by': values.completed_by,
		      'completed_on': values.completed_on
		    },
		    callback: function(r){
		      if (r.message){
		        d.hide();
						const selectedStatus = page.fields_dict.status.get_value();
						const taskName = page.fields_dict.task.get_value();
						const projectName = page.fields_dict.project.get_value();
						const customerName = page.fields_dict.customer.get_value();
						const department = page.fields_dict.department.get_value();
						const subCategory = page.fields_dict.compliance_sub_category.get_value();
						const employee = page.fields_dict.employee.get_value();
						const employeeGroup = page.fields_dict.employee_group.get_value();
						const from_date = page.fields_dict.from_date.get_value();
						const to_date = page.fields_dict.to_date.get_value();
						refresh_tasks_manually(page, selectedStatus, taskName, projectName, customerName, department, subCategory, employee, employeeGroup, from_date, to_date)
						// location.reload();
		      }
		    }
		  });
		},
	});
	d.set_value('completed_by', frappe.session.user);
d.show();
}

// Function to update status to working when clicking start time
function updateTaskStatus(page, taskName, projectName, status){
	frappe.call({
			method: "one_compliance.one_compliance.page.task_management_tool.task_management_tool.update_task_status", // Change this to your method name
			args: {
					task: taskName,
					project: projectName,
					status: status
			},
			callback: function (response) {
					if (response.message === "success") {
							page.fields_dict.status.set_value("working");
					} else {
							console.log("Failed to update task status");
					}
			}
	});
}
