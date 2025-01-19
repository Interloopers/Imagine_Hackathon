import React from 'react';
import { Link } from 'react-router-dom';
import { DeleteEmployeeById } from '../api';
import { notify } from '../utils';

function EmployeeTable({
  employees = [],
  handleUpdateEmployee,
}) {
  const handleDeleteEmployee = async (id) => {
    try {
      const { success, message } = await DeleteEmployeeById(id);
      if (success) {
        notify(message, 'success');
      } else {
        notify(message, 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Failed to delete Employee', 'error');
    }
  };

  const EmployeeCard = ({ employee }) => (
    <div className="bg-green-50 border border-green-200 rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img
          src={employee.profileImage || '/api/placeholder/300/300'}
          alt={`${employee.name}'s profile`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <Link
          to={`/dashboard/employee/${employee._id}`}
          className="text-lg font-semibold text-green-800 hover:text-green-900"
        >
          {employee.name}
        </Link>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Defects:</span> {employee.Defect}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Weight:</span> {employee.Weight} kg
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Breed:</span> {employee.Breed}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Age:</span> {employee.Age} Years
          </p>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          {handleUpdateEmployee && (
            <button
              className="p-2 text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
              onClick={() => handleUpdateEmployee(employee)}
            >
              ✏️
            </button>
          )}
          <button
            className="p-2 text-red-500 hover:text-red-600 transition-colors duration-200"
            onClick={() => handleDeleteEmployee(employee._id)}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.length === 0 ? (
        <div className="col-span-full py-8 text-center text-gray-500">
          Data Not Found
        </div>
      ) : (
        employees.map((emp) => <EmployeeCard employee={emp} key={emp._id} />)
      )}
    </div>
  );
}

export default EmployeeTable;
