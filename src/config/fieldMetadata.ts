export const fieldConfigs = {
  // Project Fields
  project: {
    name: {
      label: "What should we call this project?",
      description: "Give your project a recognizable name, like 'Smith Residence' or 'Downtown Loft'.",
      placeholder: "e.g. The Smith Residence"
    },
    description: {
      label: "Tell us a bit about the project.",
      description: "High-level goals, style preferences, or any specific requirements.",
      placeholder: "Client wants a modern farmhouse look..."
    },
    type: {
      label: "What type of project is this?",
      description: "Is this for a home, a business, or something else?",
    },
    address: {
      label: "Where is the project located?",
      description: "This helps us find local vendors and calculate travel time.",
    }
  },
  // Client Fields
  client: {
    name: {
      label: "Who is the primary contact?",
      description: "The main person we'll be communicating with.",
    },
    email: {
      label: "What's their email address?",
      description: "We'll send invites and updates here.",
    },
    phone: {
        label: "What's the best phone number?",
        description: "For quick questions or coordination.",
    }
  },
  // Contract Fields
  contract: {
      title: {
          label: "Name of this agreement",
          description: "Something descriptive for the client, e.g. 'Design Services Proposal'"
      },
      hours: {
          label: "Estimated Hours",
          description: "How many hours are included in this contract block?"
      }
  }
};
